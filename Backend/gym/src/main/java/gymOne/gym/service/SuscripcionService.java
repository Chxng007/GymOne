package gymOne.gym.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.SuscripcionRequest;
import gymOne.gym.dto.SuscripcionResponse;
import gymOne.gym.entity.Cliente;
import gymOne.gym.entity.PlanMembresia;
import gymOne.gym.entity.Suscripcion;
import gymOne.gym.repository.ClienteRepository;
import gymOne.gym.repository.SuscripcionRepository;

@Service
@Transactional
public class SuscripcionService {

    private final SuscripcionRepository suscripcionRepository;
    private final ClienteRepository clienteRepository;
    private final PlanMembresiaService planMembresiaService;

    public SuscripcionService(
            SuscripcionRepository suscripcionRepository,
            ClienteRepository clienteRepository,
            PlanMembresiaService planMembresiaService) {
        this.suscripcionRepository = suscripcionRepository;
        this.clienteRepository = clienteRepository;
        this.planMembresiaService = planMembresiaService;
    }

    public List<SuscripcionResponse> listar(Long clienteId) {
        List<Suscripcion> suscripciones = clienteId != null
                ? suscripcionRepository.findByClienteIdOrderByFechaInicioDesc(clienteId)
                : suscripcionRepository.findAllByOrderByFechaInicioDesc();
        return suscripciones.stream().map(this::toResponse).toList();
    }

    public SuscripcionResponse crear(SuscripcionRequest request) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));
        PlanMembresia plan = planMembresiaService.buscarOFallar(request.planId());

        LocalDate fechaInicio = request.fechaInicio() != null ? request.fechaInicio() : LocalDate.now();

        Suscripcion suscripcion = new Suscripcion();
        suscripcion.setCliente(cliente);
        suscripcion.setPlan(plan);
        suscripcion.setFechaInicio(fechaInicio);
        suscripcion.setFechaFin(fechaInicio.plusDays(plan.getDuracionDias()));
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.ACTIVA);

        cliente.setEstado(Cliente.EstadoCliente.ACTIVO);
        clienteRepository.save(cliente);

        return toResponse(suscripcionRepository.save(suscripcion));
    }

    public SuscripcionResponse congelar(Long id) {
        Suscripcion suscripcion = buscarOFallar(id);
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.CONGELADA);
        suscripcion.setCongeladaDesde(LocalDate.now());

        Cliente cliente = suscripcion.getCliente();
        cliente.setEstado(Cliente.EstadoCliente.SUSPENDIDO);
        clienteRepository.save(cliente);

        return toResponse(suscripcionRepository.save(suscripcion));
    }

    public SuscripcionResponse renovar(Long id) {
        Suscripcion suscripcion = buscarOFallar(id);
        LocalDate base = suscripcion.getFechaFin().isAfter(LocalDate.now())
                ? suscripcion.getFechaFin()
                : LocalDate.now();

        suscripcion.setFechaFin(base.plusDays(suscripcion.getPlan().getDuracionDias()));
        suscripcion.setEstado(Suscripcion.EstadoSuscripcion.ACTIVA);
        suscripcion.setCongeladaDesde(null);
        suscripcion.setUltimaRenovacion(LocalDate.now());

        Cliente cliente = suscripcion.getCliente();
        cliente.setEstado(Cliente.EstadoCliente.ACTIVO);
        clienteRepository.save(cliente);

        return toResponse(suscripcionRepository.save(suscripcion));
    }

    private Suscripcion buscarOFallar(Long id) {
        return suscripcionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Suscripción no encontrada"));
    }

    private SuscripcionResponse toResponse(Suscripcion suscripcion) {
        return new SuscripcionResponse(
                suscripcion.getId(),
                suscripcion.getCliente().getId(),
                suscripcion.getCliente().getPrimerNombre() + " " + (suscripcion.getCliente().getSegundoNombre() != null ? suscripcion.getCliente().getSegundoNombre() : ""),
                suscripcion.getPlan().getId(),
                suscripcion.getPlan().getNombre(),
                suscripcion.getFechaInicio(),
                suscripcion.getFechaFin(),
                suscripcion.getEstado().name(),
                suscripcion.getCongeladaDesde());
    }
}
