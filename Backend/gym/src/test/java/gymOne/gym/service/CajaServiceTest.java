package gymOne.gym.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.CajaSesion;
import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.CajaMovimientoRepository;
import gymOne.gym.repository.CajaSesionRepository;
import gymOne.gym.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class CajaServiceTest {

    @Mock
    private CajaSesionRepository cajaSesionRepository;

    @Mock
    private CajaMovimientoRepository cajaMovimientoRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    private CajaService cajaService;

    private CajaSesion nuevaSesion(BigDecimal saldoInicial, CajaSesion.EstadoCaja estado) {
        CajaSesion sesion = new CajaSesion();
        sesion.setId(1L);
        sesion.setSaldoInicial(saldoInicial);
        sesion.setEstado(estado);
        Usuario responsable = new Usuario();
        responsable.setNombre("Responsable de Prueba");
        sesion.setResponsable(responsable);
        return sesion;
    }

    private CajaMovimiento movimiento(CajaMovimiento.TipoMovimiento tipo, BigDecimal monto) {
        CajaMovimiento movimiento = new CajaMovimiento();
        movimiento.setTipo(tipo);
        movimiento.setMonto(monto);
        return movimiento;
    }

    @Test
    void cerrarCalculaSaldoFinalConIngresosYEgresos() {
        cajaService = new CajaService(cajaSesionRepository, cajaMovimientoRepository, usuarioRepository);

        CajaSesion sesion = nuevaSesion(new BigDecimal("100"), CajaSesion.EstadoCaja.ABIERTA);
        List<CajaMovimiento> movimientos = List.of(
                movimiento(CajaMovimiento.TipoMovimiento.INGRESO, new BigDecimal("50")),
                movimiento(CajaMovimiento.TipoMovimiento.EGRESO, new BigDecimal("20")));

        when(cajaSesionRepository.findById(1L)).thenReturn(java.util.Optional.of(sesion));
        when(cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(1L)).thenReturn(movimientos);
        when(cajaSesionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = cajaService.cerrar(1L);

        assertThat(response.saldoFinal().compareTo(new BigDecimal("130"))).isZero();
    }

    @Test
    void cerrarSinMovimientosDevuelveSaldoInicial() {
        cajaService = new CajaService(cajaSesionRepository, cajaMovimientoRepository, usuarioRepository);

        CajaSesion sesion = nuevaSesion(new BigDecimal("100"), CajaSesion.EstadoCaja.ABIERTA);

        when(cajaSesionRepository.findById(1L)).thenReturn(java.util.Optional.of(sesion));
        when(cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(1L)).thenReturn(List.of());
        when(cajaSesionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = cajaService.cerrar(1L);

        assertThat(response.saldoFinal().compareTo(new BigDecimal("100"))).isZero();
    }

    @Test
    void cerrarMarcaLaSesionComoCerrada() {
        cajaService = new CajaService(cajaSesionRepository, cajaMovimientoRepository, usuarioRepository);

        CajaSesion sesion = nuevaSesion(new BigDecimal("100"), CajaSesion.EstadoCaja.ABIERTA);

        when(cajaSesionRepository.findById(1L)).thenReturn(java.util.Optional.of(sesion));
        when(cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(1L)).thenReturn(List.of());
        when(cajaSesionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var response = cajaService.cerrar(1L);

        assertThat(response.estado()).isEqualTo(CajaSesion.EstadoCaja.CERRADA.name());
        assertThat(sesion.getHoraCierre()).isNotNull();
    }

    @Test
    void cerrarSesionYaCerradaLanzaConflict() {
        cajaService = new CajaService(cajaSesionRepository, cajaMovimientoRepository, usuarioRepository);

        CajaSesion sesion = nuevaSesion(new BigDecimal("100"), CajaSesion.EstadoCaja.CERRADA);

        when(cajaSesionRepository.findById(1L)).thenReturn(java.util.Optional.of(sesion));

        assertThatThrownBy(() -> cajaService.cerrar(1L))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(ex -> assertThat(((ResponseStatusException) ex).getStatusCode())
                        .isEqualTo(org.springframework.http.HttpStatus.CONFLICT));
    }

    @Test
    void movimientoAutomaticoSinCajaAbiertaNoLanzaExcepcion() {
        cajaService = new CajaService(cajaSesionRepository, cajaMovimientoRepository, usuarioRepository);

        when(cajaSesionRepository.findByFechaAndEstado(any(), any())).thenReturn(java.util.Optional.empty());

        cajaService.registrarMovimientoAutomatico(
                CajaMovimiento.TipoMovimiento.INGRESO, "Venta #1", new BigDecimal("100"), null);

        verify(cajaMovimientoRepository, never()).save(any());
    }

    @Test
    void movimientoAutomaticoConCajaAbiertaGuardaElMovimiento() {
        cajaService = new CajaService(cajaSesionRepository, cajaMovimientoRepository, usuarioRepository);

        CajaSesion sesion = nuevaSesion(new BigDecimal("100"), CajaSesion.EstadoCaja.ABIERTA);
        when(cajaSesionRepository.findByFechaAndEstado(any(), any())).thenReturn(java.util.Optional.of(sesion));

        cajaService.registrarMovimientoAutomatico(
                CajaMovimiento.TipoMovimiento.INGRESO, "Venta #1", new BigDecimal("100"), null);

        org.mockito.ArgumentCaptor<CajaMovimiento> captor = org.mockito.ArgumentCaptor.forClass(CajaMovimiento.class);
        verify(cajaMovimientoRepository).save(captor.capture());

        assertThat(captor.getValue().getTipo()).isEqualTo(CajaMovimiento.TipoMovimiento.INGRESO);
        assertThat(captor.getValue().getMonto().compareTo(new BigDecimal("100"))).isZero();
        assertThat(captor.getValue().getCajaSesion()).isEqualTo(sesion);
    }
}
