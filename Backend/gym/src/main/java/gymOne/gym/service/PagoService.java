package gymOne.gym.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.PagoRequest;
import gymOne.gym.dto.PagoResponse;
import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.Cliente;
import gymOne.gym.entity.Pago;
import gymOne.gym.entity.Suscripcion;
import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.PagoRepository;
import gymOne.gym.repository.SuscripcionRepository;
import gymOne.gym.repository.UsuarioRepository;

@Service
@Transactional
public class PagoService {

    private final PagoRepository pagoRepository;
    private final ClienteRepository clienteRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final UsuarioRepository usuarioRepository;
    private final EmailService emailService;
    private final CajaService cajaService;

    public PagoService(
            PagoRepository pagoRepository,
            ClienteRepository clienteRepository,
            SuscripcionRepository suscripcionRepository,
            UsuarioRepository usuarioRepository,
            EmailService emailService,
            CajaService cajaService) {
        this.pagoRepository = pagoRepository;
        this.clienteRepository = clienteRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
        this.cajaService = cajaService;
    }

    public List<PagoResponse> listar(Long clienteId) {
        List<Pago> pagos = clienteId != null
                ? pagoRepository.findByClienteIdOrderByFechaDesc(clienteId)
                : pagoRepository.findAllByOrderByFechaDesc();
        return pagos.stream().map(this::toResponse).toList();
    }

    public PagoResponse crear(PagoRequest request, String correoUsuario) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        Suscripcion suscripcion = null;
        if (request.suscripcionId() != null) {
            suscripcion = suscripcionRepository.findById(request.suscripcionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suscripción no encontrada"));
        }

        Usuario registradoPor = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Pago pago = new Pago();
        pago.setCliente(cliente);
        pago.setSuscripcion(suscripcion);
        pago.setTipo(Pago.TipoPago.valueOf(request.tipo()));
        pago.setMetodo(Pago.MetodoPago.valueOf(request.metodo()));
        pago.setMonto(request.monto());
        pago.setNota(request.nota());
        pago.setRegistradoPor(registradoPor);

        Pago pagoGuardado = pagoRepository.save(pago);

        if (pagoGuardado.getMetodo() == Pago.MetodoPago.EFECTIVO) {
            cajaService.registrarMovimientoAutomatico(
                    CajaMovimiento.TipoMovimiento.INGRESO,
                    "Pago #" + pagoGuardado.getId() + " - " + cliente.getPrimerNombre(),
                    pagoGuardado.getMonto(),
                    pagoGuardado);
        }

        return toResponse(pagoGuardado);
    }

    public PagoResponse notificarPago(Long id) {
        Pago pago = pagoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pago no encontrado"));

        Cliente cliente = pago.getCliente();
        if (cliente.getCorreo() == null || cliente.getCorreo().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El cliente no tiene un correo registrado");
        }

        String monto = String.format(new Locale("es", "CO"), "$%,.0f", pago.getMonto());
        String asunto = "Confirmación de pago - GymOne";
        String cuerpo = "Hola " + cliente.getPrimerNombre() + ",\n\n"
                + "Confirmamos que registramos tu pago de " + monto + " (" + pago.getTipo().name().toLowerCase(new Locale("es")) + ") "
                + "el " + pago.getFecha() + ".\n\n"
                + "¡Gracias por confiar en GymOne!";

        emailService.enviar(cliente.getCorreo(), asunto, cuerpo);

        pago.setNotificado(true);
        pago.setNotificadoEn(LocalDateTime.now());
        return toResponse(pagoRepository.save(pago));
    }

    private PagoResponse toResponse(Pago pago) {
        return new PagoResponse(
                pago.getId(),
                pago.getCliente().getId(),
                pago.getCliente().getPrimerNombre() + " " + (pago.getCliente().getSegundoNombre() != null ? pago.getCliente().getSegundoNombre() : ""),
                pago.getSuscripcion() != null ? pago.getSuscripcion().getId() : null,
                pago.getTipo().name(),
                pago.getMetodo().name(),
                pago.getMonto(),
                pago.getFecha(),
                pago.getRegistradoPor().getNombre(),
                pago.getNota(),
                pago.isNotificado(),
                pago.getCliente().getCorreo() != null && !pago.getCliente().getCorreo().isBlank());
    }
}
