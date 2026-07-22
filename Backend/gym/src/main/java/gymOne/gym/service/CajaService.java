package gymOne.gym.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.CajaMovimientoRequest;
import gymOne.gym.dto.CajaMovimientoResponse;
import gymOne.gym.dto.CajaSesionResponse;
import gymOne.gym.entity.CajaMovimiento;
import gymOne.gym.entity.CajaSesion;
import gymOne.gym.entity.Pago;
import gymOne.gym.entity.Usuario;
import gymOne.gym.repository.CajaMovimientoRepository;
import gymOne.gym.repository.CajaSesionRepository;
import gymOne.gym.repository.UsuarioRepository;

@Service
@Transactional
public class CajaService {

    private static final Logger log = LoggerFactory.getLogger(CajaService.class);

    private final CajaSesionRepository cajaSesionRepository;
    private final CajaMovimientoRepository cajaMovimientoRepository;
    private final UsuarioRepository usuarioRepository;

    public CajaService(
            CajaSesionRepository cajaSesionRepository,
            CajaMovimientoRepository cajaMovimientoRepository,
            UsuarioRepository usuarioRepository) {
        this.cajaSesionRepository = cajaSesionRepository;
        this.cajaMovimientoRepository = cajaMovimientoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public CajaSesionResponse abrir(BigDecimal saldoInicial, String correoUsuario) {
        LocalDate hoy = LocalDate.now();

        if (cajaSesionRepository.findByFechaAndEstado(hoy, CajaSesion.EstadoCaja.ABIERTA).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una caja abierta para hoy");
        }

        Usuario responsable = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        CajaSesion sesion = new CajaSesion();
        sesion.setSaldoInicial(saldoInicial);
        sesion.setResponsable(responsable);

        return toResponse(cajaSesionRepository.save(sesion));
    }

    public CajaSesionResponse obtenerActual() {
        CajaSesion sesion = cajaSesionRepository.findTopByFechaOrderByHoraAperturaDesc(LocalDate.now())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay caja registrada hoy"));
        return toResponse(sesion);
    }

    public List<CajaSesionResponse> historial() {
        return cajaSesionRepository.findAllByOrderByFechaDesc().stream().map(this::toResponse).toList();
    }

    public CajaSesionResponse obtenerActualOSiNulo() {
        return cajaSesionRepository.findTopByFechaOrderByHoraAperturaDesc(LocalDate.now())
                .map(this::toResponse)
                .orElse(null);
    }

    public void registrarMovimientoAutomatico(CajaMovimiento.TipoMovimiento tipo, String concepto, BigDecimal monto, Pago referenciaPago) {
        CajaSesion sesion = cajaSesionRepository.findByFechaAndEstado(LocalDate.now(), CajaSesion.EstadoCaja.ABIERTA)
                .orElse(null);

        if (sesion == null) {
            log.warn("No hay caja abierta; no se registró el movimiento automático: {}", concepto);
            return;
        }

        CajaMovimiento movimiento = new CajaMovimiento();
        movimiento.setCajaSesion(sesion);
        movimiento.setTipo(tipo);
        movimiento.setConcepto(concepto);
        movimiento.setMonto(monto);
        movimiento.setReferenciaPago(referenciaPago);

        cajaMovimientoRepository.save(movimiento);
    }

    public CajaMovimientoResponse registrarMovimiento(Long sesionId, CajaMovimientoRequest request) {
        CajaSesion sesion = buscarSesionOFallar(sesionId);

        if (sesion.getEstado() == CajaSesion.EstadoCaja.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La caja ya está cerrada");
        }

        CajaMovimiento movimiento = new CajaMovimiento();
        movimiento.setCajaSesion(sesion);
        movimiento.setTipo(CajaMovimiento.TipoMovimiento.valueOf(request.tipo()));
        movimiento.setConcepto(request.concepto());
        movimiento.setMonto(request.monto());

        return toResponse(cajaMovimientoRepository.save(movimiento));
    }

    public CajaSesionResponse cerrar(Long sesionId) {
        CajaSesion sesion = buscarSesionOFallar(sesionId);

        if (sesion.getEstado() == CajaSesion.EstadoCaja.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La caja ya está cerrada");
        }

        List<CajaMovimiento> movimientos = cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(sesionId);
        BigDecimal saldoFinal = sesion.getSaldoInicial().add(totalPorTipo(movimientos, CajaMovimiento.TipoMovimiento.INGRESO))
                .subtract(totalPorTipo(movimientos, CajaMovimiento.TipoMovimiento.EGRESO));

        sesion.setSaldoFinal(saldoFinal);
        sesion.setHoraCierre(java.time.LocalDateTime.now());
        sesion.setEstado(CajaSesion.EstadoCaja.CERRADA);

        return toResponse(cajaSesionRepository.save(sesion));
    }

    private CajaSesion buscarSesionOFallar(Long id) {
        return cajaSesionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Sesión de caja no encontrada"));
    }

    private BigDecimal totalPorTipo(List<CajaMovimiento> movimientos, CajaMovimiento.TipoMovimiento tipo) {
        return movimientos.stream()
                .filter(m -> m.getTipo() == tipo)
                .map(CajaMovimiento::getMonto)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private CajaSesionResponse toResponse(CajaSesion sesion) {
        List<CajaMovimiento> movimientos = cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(sesion.getId());
        BigDecimal totalIngresos = totalPorTipo(movimientos, CajaMovimiento.TipoMovimiento.INGRESO);
        BigDecimal totalEgresos = totalPorTipo(movimientos, CajaMovimiento.TipoMovimiento.EGRESO);
        BigDecimal saldoActual = sesion.getSaldoInicial().add(totalIngresos).subtract(totalEgresos);

        return new CajaSesionResponse(
                sesion.getId(),
                sesion.getFecha(),
                sesion.getHoraApertura(),
                sesion.getHoraCierre(),
                sesion.getSaldoInicial(),
                sesion.getSaldoFinal(),
                totalIngresos,
                totalEgresos,
                saldoActual,
                sesion.getResponsable().getNombre(),
                sesion.getEstado().name(),
                movimientos.stream().map(this::toResponse).toList());
    }

    private CajaMovimientoResponse toResponse(CajaMovimiento movimiento) {
        return new CajaMovimientoResponse(
                movimiento.getId(),
                movimiento.getTipo().name(),
                movimiento.getConcepto(),
                movimiento.getMonto(),
                movimiento.getFecha());
    }
}
