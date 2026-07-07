package gymOne.gym.service;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import gymOne.gym.dto.PlanMembresiaRequest;
import gymOne.gym.dto.PlanMembresiaResponse;
import gymOne.gym.entity.PlanMembresia;
import gymOne.gym.repository.PlanMembresiaRepository;

@Service
@Transactional
public class PlanMembresiaService {

    private final PlanMembresiaRepository planMembresiaRepository;

    public PlanMembresiaService(PlanMembresiaRepository planMembresiaRepository) {
        this.planMembresiaRepository = planMembresiaRepository;
    }

    public List<PlanMembresiaResponse> listar(boolean soloActivos) {
        List<PlanMembresia> planes = soloActivos
                ? planMembresiaRepository.findByActivoTrue()
                : planMembresiaRepository.findAll();
        return planes.stream().map(this::toResponse).toList();
    }

    public PlanMembresiaResponse obtener(Long id) {
        return toResponse(buscarOFallar(id));
    }

    public PlanMembresiaResponse crear(PlanMembresiaRequest request) {
        PlanMembresia plan = new PlanMembresia();
        aplicar(plan, request);
        return toResponse(planMembresiaRepository.save(plan));
    }

    public PlanMembresiaResponse actualizar(Long id, PlanMembresiaRequest request) {
        PlanMembresia plan = buscarOFallar(id);
        aplicar(plan, request);
        return toResponse(planMembresiaRepository.save(plan));
    }

    public void eliminar(Long id) {
        PlanMembresia plan = buscarOFallar(id);
        plan.setActivo(false);
        planMembresiaRepository.save(plan);
    }

    PlanMembresia buscarOFallar(Long id) {
        return planMembresiaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Plan no encontrado"));
    }

    private void aplicar(PlanMembresia plan, PlanMembresiaRequest request) {
        plan.setNombre(request.nombre());
        plan.setDuracionDias(request.duracionDias());
        plan.setPrecio(request.precio());
        plan.setBeneficios(request.beneficios() != null ? request.beneficios() : new ArrayList<>());
        if (request.activo() != null) {
            plan.setActivo(request.activo());
        }
    }

    private PlanMembresiaResponse toResponse(PlanMembresia plan) {
        return new PlanMembresiaResponse(
                plan.getId(),
                plan.getNombre(),
                plan.getDuracionDias(),
                plan.getPrecio(),
                new ArrayList<>(plan.getBeneficios()),
                plan.isActivo());
    }
}
