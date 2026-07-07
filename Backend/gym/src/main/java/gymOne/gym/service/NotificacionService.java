package gymOne.gym.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gymOne.gym.dto.NotificacionResponse;
import gymOne.gym.entity.CajaSesion;
import gymOne.gym.entity.Cliente;
import gymOne.gym.entity.Notificacion;
import gymOne.gym.entity.Producto;
import gymOne.gym.entity.Suscripcion;
import gymOne.gym.repository.CajaSesionRepository;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.NotificacionRepository;
import gymOne.gym.repository.ProductoRepository;
import gymOne.gym.repository.SuscripcionRepository;

@Service
@Transactional
public class NotificacionService {

    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);
    private static final int STOCK_MINIMO = 3;

    private final NotificacionRepository notificacionRepository;
    private final SuscripcionRepository suscripcionRepository;
    private final ProductoRepository productoRepository;
    private final CajaSesionRepository cajaSesionRepository;
    private final ClienteRepository clienteRepository;

    public NotificacionService(
            NotificacionRepository notificacionRepository,
            SuscripcionRepository suscripcionRepository,
            ProductoRepository productoRepository,
            CajaSesionRepository cajaSesionRepository,
            ClienteRepository clienteRepository) {
        this.notificacionRepository = notificacionRepository;
        this.suscripcionRepository = suscripcionRepository;
        this.productoRepository = productoRepository;
        this.cajaSesionRepository = cajaSesionRepository;
        this.clienteRepository = clienteRepository;
    }

    public List<NotificacionResponse> listar() {
        return notificacionRepository.findAllByOrderByCreatedAtDesc().stream().map(this::toResponse).toList();
    }

    public void marcarLeida(Long id) {
        notificacionRepository.findById(id).ifPresent(n -> {
            n.setLeida(true);
            notificacionRepository.save(n);
        });
    }

    @Scheduled(cron = "0 0 * * * *")
    public void evaluar() {
        LocalDate hoy = LocalDate.now();
        LocalDateTime inicioHoy = hoy.atStartOfDay();
        LocalDateTime finHoy = hoy.atTime(LocalTime.MAX);

        evaluarVencimientos(hoy, inicioHoy, finHoy);
        evaluarStockBajo(inicioHoy, finHoy);
        evaluarCajaAbierta(hoy, inicioHoy, finHoy);
        evaluarPagoPendiente(inicioHoy, finHoy);
    }

    private void evaluarVencimientos(LocalDate hoy, LocalDateTime inicioHoy, LocalDateTime finHoy) {
        List<Suscripcion> porVencer = suscripcionRepository.findByFechaFinAndEstado(hoy.plusDays(1), Suscripcion.EstadoSuscripcion.ACTIVA);
        for (Suscripcion suscripcion : porVencer) {
            Cliente cliente = suscripcion.getCliente();
            if (notificacionRepository.existsByTipoAndClienteRelacionadoIdAndCreatedAtBetween(
                    Notificacion.Tipo.VENCIMIENTO, cliente.getId(), inicioHoy, finHoy)) {
                continue;
            }
            crear(Notificacion.Tipo.VENCIMIENTO,
                    "La membresía de " + cliente.getPrimerNombre() + " vence mañana", cliente);
        }
    }

    private void evaluarStockBajo(LocalDateTime inicioHoy, LocalDateTime finHoy) {
        List<Producto> productos = productoRepository.findAll();
        for (Producto producto : productos) {
            if (producto.getStock() > STOCK_MINIMO) continue;
            String mensaje = "Stock bajo: " + producto.getNombre() + " (quedan " + producto.getStock() + ")";
            if (notificacionRepository.existsByTipoAndMensajeAndCreatedAtBetween(
                    Notificacion.Tipo.STOCK_BAJO, mensaje, inicioHoy, finHoy)) {
                continue;
            }
            crear(Notificacion.Tipo.STOCK_BAJO, mensaje, null);
        }
    }

    private void evaluarCajaAbierta(LocalDate hoy, LocalDateTime inicioHoy, LocalDateTime finHoy) {
        List<CajaSesion> abiertasDeAntes = cajaSesionRepository.findByEstadoAndFechaBefore(CajaSesion.EstadoCaja.ABIERTA, hoy);
        for (CajaSesion sesion : abiertasDeAntes) {
            String mensaje = "La caja del " + sesion.getFecha() + " quedó abierta sin cerrar";
            if (notificacionRepository.existsByTipoAndMensajeAndCreatedAtBetween(
                    Notificacion.Tipo.CAJA_ABIERTA, mensaje, inicioHoy, finHoy)) {
                continue;
            }
            crear(Notificacion.Tipo.CAJA_ABIERTA, mensaje, null);
        }
    }

    private void evaluarPagoPendiente(LocalDateTime inicioHoy, LocalDateTime finHoy) {
        List<Cliente> vencidos = clienteRepository.findByEstado(Cliente.EstadoCliente.VENCIDO);
        for (Cliente cliente : vencidos) {
            if (notificacionRepository.existsByTipoAndClienteRelacionadoIdAndCreatedAtBetween(
                    Notificacion.Tipo.PAGO_PENDIENTE, cliente.getId(), inicioHoy, finHoy)) {
                continue;
            }
            crear(Notificacion.Tipo.PAGO_PENDIENTE, cliente.getPrimerNombre() + " tiene la membresía vencida", cliente);
        }
    }

    private void crear(Notificacion.Tipo tipo, String mensaje, Cliente cliente) {
        Notificacion notificacion = new Notificacion();
        notificacion.setTipo(tipo);
        notificacion.setMensaje(mensaje);
        notificacion.setClienteRelacionado(cliente);
        notificacionRepository.save(notificacion);
        log.info("Notificación generada [{}]: {}", tipo, mensaje);
    }

    private NotificacionResponse toResponse(Notificacion notificacion) {
        return new NotificacionResponse(
                notificacion.getId(),
                notificacion.getTipo().name(),
                notificacion.getMensaje(),
                notificacion.isLeida(),
                notificacion.getClienteRelacionado() != null ? notificacion.getClienteRelacionado().getId() : null,
                notificacion.getCreatedAt());
    }
}
