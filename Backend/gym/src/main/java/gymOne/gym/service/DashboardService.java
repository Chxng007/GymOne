package gymOne.gym.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gymOne.gym.dto.CajaSesionResponse;
import gymOne.gym.dto.DashboardResponse;
import gymOne.gym.dto.TendenciaDiaResponse;
import gymOne.gym.entity.Asistencia;
import gymOne.gym.entity.Cliente;
import gymOne.gym.entity.Gasto;
import gymOne.gym.entity.Pago;
import gymOne.gym.entity.Venta;
import gymOne.gym.entity.VentaItem;
import gymOne.gym.repository.AsistenciaRepository;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.GastoRepository;
import gymOne.gym.repository.PagoRepository;
import gymOne.gym.repository.SuscripcionRepository;
import gymOne.gym.repository.VentaRepository;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ClienteRepository clienteRepository;
    private final PagoRepository pagoRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final AsistenciaRepository asistenciaRepository;
    private final VentaRepository ventaRepository;
    private final GastoRepository gastoRepository;
    private final CajaService cajaService;

    public DashboardService(
            ClienteRepository clienteRepository,
            PagoRepository pagoRepository,
            SuscripcionRepository suscripcionRepository,
            AsistenciaRepository asistenciaRepository,
            VentaRepository ventaRepository,
            GastoRepository gastoRepository,
            CajaService cajaService) {
        this.clienteRepository = clienteRepository;
        this.pagoRepository = pagoRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.asistenciaRepository = asistenciaRepository;
        this.ventaRepository = ventaRepository;
        this.gastoRepository = gastoRepository;
        this.cajaService = cajaService;
    }

    public DashboardResponse resumen() {
        LocalDate hoy = LocalDate.now();
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDateTime inicioHoy = hoy.atStartOfDay();
        LocalDateTime finHoy = hoy.atTime(LocalTime.MAX);
        LocalDateTime inicioMesDateTime = inicioMes.atStartOfDay();

        long clientesActivos = clienteRepository.countByEstado(Cliente.EstadoCliente.ACTIVO);
        long clientesVencidos = clienteRepository.countByEstado(Cliente.EstadoCliente.VENCIDO);

        BigDecimal ingresosHoy = sumarPagos(pagoRepository.findByFechaBetween(inicioHoy, finHoy));
        BigDecimal ingresosMes = sumarPagos(pagoRepository.findByFechaBetween(inicioMesDateTime, finHoy));

        long nuevosClientes = clienteRepository.countByCreatedAt(hoy);
        long renovaciones = suscripcionRepository.countByUltimaRenovacion(hoy);
        long asistenciaHoy = asistenciaRepository.findByFechaOrderByHoraEntradaDesc(hoy).size();

        List<Venta> ventasHoy = ventaRepository.findByFechaBetweenWithItems(inicioHoy, finHoy);
        int productosVendidos = ventasHoy.stream()
                .flatMap(v -> v.getItems().stream())
                .mapToInt(VentaItem::getCantidad)
                .sum();

        List<Venta> ventasMes = ventaRepository.findByFechaBetween(inicioMesDateTime, finHoy);
        BigDecimal totalVentasMes = ventasMes.stream().map(Venta::getTotal).reduce(BigDecimal.ZERO, BigDecimal::add);

        List<Gasto> gastosMes = gastoRepository.findByFechaBetween(inicioMes, hoy);
        BigDecimal totalGastosMes = gastosMes.stream().map(Gasto::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal gananciaMensual = totalVentasMes.add(ingresosMes).subtract(totalGastosMes);

        CajaSesionResponse cajaActual = cajaService.obtenerActualOSiNulo();

        return new DashboardResponse(
                clientesActivos,
                clientesVencidos,
                ingresosHoy,
                ingresosMes,
                nuevosClientes,
                renovaciones,
                asistenciaHoy,
                productosVendidos,
                gananciaMensual,
                cajaActual != null,
                cajaActual != null ? cajaActual.saldoActual() : null);
    }

    public List<TendenciaDiaResponse> tendencia() {
        LocalDate hoy = LocalDate.now();
        LocalDate hace6Dias = hoy.minusDays(6);
        LocalDateTime inicio = hace6Dias.atStartOfDay();
        LocalDateTime fin = hoy.atTime(LocalTime.MAX);

        Map<LocalDate, BigDecimal> ingresosPorDia = pagoRepository.findByFechaBetween(inicio, fin).stream()
                .collect(Collectors.groupingBy(
                        p -> p.getFecha().toLocalDate(),
                        Collectors.reducing(BigDecimal.ZERO, Pago::getMonto, BigDecimal::add)));

        Map<LocalDate, Long> asistenciasPorDia = asistenciaRepository.findByFechaBetween(hace6Dias, hoy).stream()
                .collect(Collectors.groupingBy(Asistencia::getFecha, Collectors.counting()));

        return hace6Dias.datesUntil(hoy.plusDays(1))
                .map(dia -> new TendenciaDiaResponse(
                        dia,
                        ingresosPorDia.getOrDefault(dia, BigDecimal.ZERO),
                        asistenciasPorDia.getOrDefault(dia, 0L)))
                .toList();
    }

    private BigDecimal sumarPagos(List<Pago> pagos) {
        return pagos.stream().map(Pago::getMonto).reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
