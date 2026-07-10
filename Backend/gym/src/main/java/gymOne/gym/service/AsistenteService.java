package gymOne.gym.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.annotation.JsonProperty;

import gymOne.gym.dto.AsistenteResponse;
import gymOne.gym.dto.ConfiguracionResponse;
import gymOne.gym.dto.DashboardResponse;
import gymOne.gym.entity.Cliente;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.EntrenadorRepository;
import gymOne.gym.repository.ProductoRepository;

@Service
public class AsistenteService {

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    private final DashboardService dashboardService;
    private final ConfiguracionService configuracionService;
    private final ClienteRepository clienteRepository;
    private final EntrenadorRepository entrenadorRepository;
    private final ProductoRepository productoRepository;
    private final RestClient restClient = RestClient.create();

    @Value("${gemini.api-key:}")
    private String apiKey;

    public AsistenteService(
            DashboardService dashboardService,
            ConfiguracionService configuracionService,
            ClienteRepository clienteRepository,
            EntrenadorRepository entrenadorRepository,
            ProductoRepository productoRepository) {
        this.dashboardService = dashboardService;
        this.configuracionService = configuracionService;
        this.clienteRepository = clienteRepository;
        this.entrenadorRepository = entrenadorRepository;
        this.productoRepository = productoRepository;
    }

    public AsistenteResponse preguntar(String pregunta) {
        if (apiKey == null || apiKey.isBlank()) {
            return new AsistenteResponse(
                    "El asistente todavía no está configurado. Pídele al administrador del sistema que agregue la variable de entorno GEMINI_API_KEY en el backend.");
        }

        String contexto = construirContexto();
        String instrucciones =
                "Eres el asistente de datos de GymOne, un sistema de gestión de gimnasios. "
                        + "Responde SIEMPRE en español, de forma breve y directa (máximo un par de frases o una lista corta). "
                        + "Usa EXCLUSIVAMENTE los datos del snapshot que te doy a continuación; no inventes cifras. "
                        + "Si la pregunta no se puede responder con esos datos, dilo claramente y sugiere dónde podría consultarlo en la plataforma. "
                        + "Formatea montos de dinero con separador de miles y símbolo $.\n\n"
                        + "SNAPSHOT ACTUAL DE LA PLATAFORMA:\n" + contexto;

        GeminiRequest body = new GeminiRequest(
                new GeminiRequest.SystemInstruction(List.of(new GeminiRequest.Part(instrucciones))),
                List.of(new GeminiRequest.Content(List.of(new GeminiRequest.Part(pregunta)))));

        GeminiResponse response = restClient.post()
                .uri(GEMINI_URL + "?key={key}", apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(GeminiResponse.class);

        String texto = extraerTexto(response);

        return new AsistenteResponse(texto.isBlank() ? "No pude generar una respuesta. Intenta reformular la pregunta." : texto);
    }

    private String extraerTexto(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            return "";
        }
        GeminiResponse.Content content = response.candidates().get(0).content();
        if (content == null || content.parts() == null) {
            return "";
        }
        return content.parts().stream().map(GeminiResponse.Part::text).reduce("", String::concat);
    }

    private String construirContexto() {
        DashboardResponse resumen = dashboardService.resumen();
        ConfiguracionResponse config = configuracionService.obtener();

        long totalClientes = clienteRepository.count();
        long totalEntrenadores = entrenadorRepository.count();
        long productosStockBajo = productoRepository.findAll().stream().filter(p -> p.getStock() <= 3).count();

        BigDecimal meta = config.metaIngresosMensual();
        String metaTexto = meta != null
                ? "$" + formatear(meta) + " (faltan $" + formatear(meta.subtract(resumen.ingresosMes()).max(BigDecimal.ZERO)) + " para alcanzarla)"
                : "no configurada por el administrador";

        List<Cliente> vencidosProximos = clienteRepository.findByEstado(Cliente.EstadoCliente.VENCIDO);

        return """
                Fecha de hoy: %s

                Ingresos de hoy: $%s
                Ingresos del mes: $%s
                Meta de ingresos mensual: %s
                Ganancia mensual (ventas + pagos - gastos): $%s

                Clientes activos: %d
                Clientes vencidos: %d
                Total de clientes registrados históricamente: %d
                Nuevos clientes hoy: %d
                Renovaciones hoy: %d

                Asistencia de hoy (personas que entraron): %d
                Productos vendidos hoy: %d

                Caja: %s%s

                Entrenadores registrados: %d
                Productos con stock bajo (<=3 unidades): %d
                """
                .formatted(
                        LocalDate.now(),
                        formatear(resumen.ingresosHoy()),
                        formatear(resumen.ingresosMes()),
                        metaTexto,
                        formatear(resumen.gananciaMensual()),
                        resumen.clientesActivos(),
                        resumen.clientesVencidos(),
                        totalClientes,
                        resumen.nuevosClientes(),
                        resumen.renovaciones(),
                        resumen.asistenciaHoy(),
                        resumen.productosVendidos(),
                        resumen.cajaAbierta() ? "abierta" : "cerrada",
                        resumen.cajaAbierta() && resumen.cajaSaldoActual() != null ? ", saldo actual $" + formatear(resumen.cajaSaldoActual()) : "",
                        totalEntrenadores,
                        productosStockBajo);
    }

    private String formatear(BigDecimal valor) {
        if (valor == null) return "0";
        return String.format(new Locale("es", "CO"), "%,.0f", valor);
    }

    private record GeminiRequest(
            @JsonProperty("system_instruction") SystemInstruction systemInstruction,
            List<Content> contents) {

        private record SystemInstruction(List<Part> parts) {}

        private record Content(List<Part> parts) {}

        private record Part(String text) {}
    }

    private record GeminiResponse(List<Candidate> candidates) {

        private record Candidate(Content content) {}

        private record Content(List<Part> parts) {}

        private record Part(String text) {}
    }
}
