package gymOne.gym.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import gymOne.gym.config.SecurityConfig;
import gymOne.gym.dto.CajaSesionResponse;
import gymOne.gym.dto.ConfiguracionResponse;
import gymOne.gym.security.CustomUserDetailsService;
import gymOne.gym.security.JwtAuthFilter;
import gymOne.gym.service.CajaService;
import gymOne.gym.service.ClienteService;
import gymOne.gym.service.ConfiguracionService;
import gymOne.gym.service.GastoService;
import gymOne.gym.service.VentaService;

@WebMvcTest({
        ConfiguracionController.class,
        CajaController.class,
        GastoController.class,
        ClienteController.class,
        VentaController.class
})
@Import(SecurityConfig.class)
class AutorizacionRolesTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ConfiguracionService configuracionService;

    @MockitoBean
    private CajaService cajaService;

    @MockitoBean
    private GastoService gastoService;

    @MockitoBean
    private ClienteService clienteService;

    @MockitoBean
    private VentaService ventaService;

    @MockitoBean
    private JwtAuthFilter jwtAuthFilter;

    @MockitoBean
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void dejarPasarLaPeticionEnElFiltroMockeado() throws Exception {
        doAnswer(invocation -> {
            jakarta.servlet.http.HttpServletRequest req = invocation.getArgument(0);
            jakarta.servlet.http.HttpServletResponse res = invocation.getArgument(1);
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(req, res);
            return null;
        }).when(jwtAuthFilter).doFilter(any(), any(), any());
    }

    private static CajaSesionResponse dummySesion() {
        return new CajaSesionResponse(1L, null, null, null, BigDecimal.TEN, null,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.TEN, "Responsable", "ABIERTA", List.of());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void putConfiguracionComoRecepcionistaEs403() throws Exception {
        mockMvc.perform(put("/api/configuracion").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Gym\",\"moneda\":\"USD\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMINISTRADOR")
    void putConfiguracionComoAdministradorEs200() throws Exception {
        when(configuracionService.actualizar(any())).thenReturn(
                new ConfiguracionResponse(1L, "Gym", null, null, null, "USD", null, null, null, null));

        mockMvc.perform(put("/api/configuracion").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"nombre\":\"Gym\",\"moneda\":\"USD\"}"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void getConfiguracionComoRecepcionistaEs200() throws Exception {
        when(configuracionService.obtener()).thenReturn(
                new ConfiguracionResponse(1L, "Gym", null, null, null, "USD", null, null, null, null));

        mockMvc.perform(get("/api/configuracion"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void cerrarCajaComoRecepcionistaEs403() throws Exception {
        mockMvc.perform(post("/api/caja/1/cerrar").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void abrirCajaComoRecepcionistaEs201() throws Exception {
        when(cajaService.abrir(any(), anyString())).thenReturn(dummySesion());

        mockMvc.perform(post("/api/caja/abrir").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"saldoInicial\":100}"))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void crearGastoComoRecepcionistaEs403() throws Exception {
        mockMvc.perform(post("/api/gastos").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoria\":\"Servicios\",\"descripcion\":\"Luz\",\"monto\":50}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void listarGastosComoRecepcionistaEs200() throws Exception {
        when(gastoService.listar()).thenReturn(List.of());

        mockMvc.perform(get("/api/gastos"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void eliminarClienteComoRecepcionistaEs403() throws Exception {
        mockMvc.perform(delete("/api/clientes/1").with(csrf()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ENTRENADOR")
    void crearVentaComoEntrenadorEs403() throws Exception {
        mockMvc.perform(post("/api/ventas").with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[{\"productoId\":1,\"cantidad\":2}],\"descuento\":0,\"metodoPago\":\"EFECTIVO\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ENTRENADOR")
    void listarClientesComoEntrenadorEs200() throws Exception {
        when(clienteService.listar(any())).thenReturn(List.of());

        mockMvc.perform(get("/api/clientes"))
                .andExpect(status().isOk());
    }
}
