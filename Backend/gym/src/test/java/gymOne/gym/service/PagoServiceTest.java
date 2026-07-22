package gymOne.gym.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import gymOne.gym.dto.PagoRequest;
import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.Cliente;
import gymOne.gym.entity.Pago;
import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.PagoRepository;
import gymOne.gym.repository.SuscripcionRepository;
import gymOne.gym.repository.UsuarioRepository;

@ExtendWith(MockitoExtension.class)
class PagoServiceTest {

    @Mock
    private PagoRepository pagoRepository;

    @Mock
    private ClienteRepository clienteRepository;

    @Mock
    private SuscripcionRepository suscripcionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private CajaService cajaService;

    private PagoService pagoService;

    private void mockearDependenciasComunes() {
        Cliente cliente = new Cliente();
        cliente.setId(1L);
        cliente.setPrimerNombre("Ana");
        Usuario usuario = new Usuario();
        usuario.setNombre("Recepcion");

        when(clienteRepository.findById(1L)).thenReturn(Optional.of(cliente));
        when(usuarioRepository.findByCorreo("recepcion@gymone.local")).thenReturn(Optional.of(usuario));
        when(pagoRepository.save(any())).thenAnswer(invocation -> {
            Pago pago = invocation.getArgument(0);
            pago.setId(5L);
            return pago;
        });
    }

    @Test
    void pagoEnEfectivoRegistraIngresoConReferencia() {
        pagoService = new PagoService(pagoRepository, clienteRepository, suscripcionRepository, usuarioRepository, emailService, cajaService);
        mockearDependenciasComunes();

        PagoRequest request = new PagoRequest(1L, null, "PAGO", "EFECTIVO", new BigDecimal("50000"), null);

        pagoService.crear(request, "recepcion@gymone.local");

        ArgumentCaptor<Pago> pagoCaptor = ArgumentCaptor.forClass(Pago.class);
        verify(cajaService).registrarMovimientoAutomatico(
                eq(CajaMovimiento.TipoMovimiento.INGRESO), any(), eq(new BigDecimal("50000")), pagoCaptor.capture());

        assertThat(pagoCaptor.getValue().getId()).isEqualTo(5L);
    }

    @Test
    void pagoConTransferenciaNoRegistraMovimiento() {
        pagoService = new PagoService(pagoRepository, clienteRepository, suscripcionRepository, usuarioRepository, emailService, cajaService);
        mockearDependenciasComunes();

        PagoRequest request = new PagoRequest(1L, null, "PAGO", "TRANSFERENCIA", new BigDecimal("50000"), null);

        pagoService.crear(request, "recepcion@gymone.local");

        verify(cajaService, never()).registrarMovimientoAutomatico(any(), any(), any(), any());
    }
}
