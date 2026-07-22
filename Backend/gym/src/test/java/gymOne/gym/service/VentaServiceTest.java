package gymOne.gym.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import gymOne.gym.dto.VentaItemRequest;
import gymOne.gym.dto.VentaRequest;
import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.Producto;
import gymOne.gym.entity.Usuario;
import gymOne.gym.entity.Venta;
import gymOne.gym.repository.UsuarioRepository;
import gymOne.gym.repository.VentaRepository;

@ExtendWith(MockitoExtension.class)
class VentaServiceTest {

    @Mock
    private VentaRepository ventaRepository;

    @Mock
    private ProductoService productoService;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private CajaService cajaService;

    private VentaService ventaService;

    private Producto producto(BigDecimal precio, int stock) {
        Producto producto = new Producto();
        producto.setId(1L);
        producto.setNombre("Proteina");
        producto.setPrecio(precio);
        producto.setStock(stock);
        return producto;
    }

    private void mockearDependenciasComunes(Producto producto) {
        Usuario usuario = new Usuario();
        usuario.setNombre("Vendedor");
        when(usuarioRepository.findByCorreo("vendedor@gymone.local")).thenReturn(Optional.of(usuario));
        when(productoService.buscarOFallar(1L)).thenReturn(producto);
        when(ventaRepository.save(any())).thenAnswer(invocation -> {
            Venta venta = invocation.getArgument(0);
            venta.setId(10L);
            return venta;
        });
    }

    @Test
    void ventaEnEfectivoRegistraIngresoEnCaja() {
        ventaService = new VentaService(ventaRepository, productoService, usuarioRepository, cajaService);
        Producto producto = producto(new BigDecimal("20000"), 10);
        mockearDependenciasComunes(producto);

        VentaRequest request = new VentaRequest(
                List.of(new VentaItemRequest(1L, 2)), BigDecimal.ZERO, "EFECTIVO");

        ventaService.crear(request, "vendedor@gymone.local");

        ArgumentCaptor<BigDecimal> montoCaptor = ArgumentCaptor.forClass(BigDecimal.class);
        verify(cajaService).registrarMovimientoAutomatico(
                eq(CajaMovimiento.TipoMovimiento.INGRESO), any(), montoCaptor.capture(), isNull());

        assertThat(montoCaptor.getValue().compareTo(new BigDecimal("40000"))).isZero();
    }

    @Test
    void ventaConTarjetaNoRegistraMovimiento() {
        ventaService = new VentaService(ventaRepository, productoService, usuarioRepository, cajaService);
        Producto producto = producto(new BigDecimal("20000"), 10);
        mockearDependenciasComunes(producto);

        VentaRequest request = new VentaRequest(
                List.of(new VentaItemRequest(1L, 2)), BigDecimal.ZERO, "TARJETA");

        ventaService.crear(request, "vendedor@gymone.local");

        verify(cajaService, never()).registrarMovimientoAutomatico(any(), any(), any(), any());
    }

    @Test
    void elMontoDelIngresoUsaElTotalConDescuento() {
        ventaService = new VentaService(ventaRepository, productoService, usuarioRepository, cajaService);
        Producto producto = producto(new BigDecimal("20000"), 10);
        mockearDependenciasComunes(producto);

        VentaRequest request = new VentaRequest(
                List.of(new VentaItemRequest(1L, 2)), new BigDecimal("5000"), "EFECTIVO");

        ventaService.crear(request, "vendedor@gymone.local");

        ArgumentCaptor<BigDecimal> montoCaptor = ArgumentCaptor.forClass(BigDecimal.class);
        verify(cajaService).registrarMovimientoAutomatico(
                eq(CajaMovimiento.TipoMovimiento.INGRESO), any(), montoCaptor.capture(), isNull());

        assertThat(montoCaptor.getValue().compareTo(new BigDecimal("35000"))).isZero();
    }
}
