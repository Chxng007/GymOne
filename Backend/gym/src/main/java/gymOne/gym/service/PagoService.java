package gymOne.gym.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.PagoRequest;
import gymOne.gym.dto.PagoResponse;
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

    public PagoService(
            PagoRepository pagoRepository,
            ClienteRepository clienteRepository,
            SuscripcionRepository suscripcionRepository,
            UsuarioRepository usuarioRepository) {
        this.pagoRepository = pagoRepository;
        this.clienteRepository = clienteRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.usuarioRepository = usuarioRepository;
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
                pago.getNota());
    }
}
