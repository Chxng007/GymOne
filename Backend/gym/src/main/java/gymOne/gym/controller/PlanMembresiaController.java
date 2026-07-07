package gymOne.gym.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.PlanMembresiaRequest;
import gymOne.gym.dto.PlanMembresiaResponse;
import gymOne.gym.service.PlanMembresiaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/planes-membresia")
public class PlanMembresiaController {

    private final PlanMembresiaService planMembresiaService;

    public PlanMembresiaController(PlanMembresiaService planMembresiaService) {
        this.planMembresiaService = planMembresiaService;
    }

    @GetMapping
    public List<PlanMembresiaResponse> listar(@RequestParam(defaultValue = "false") boolean soloActivos) {
        return planMembresiaService.listar(soloActivos);
    }

    @GetMapping("/{id}")
    public PlanMembresiaResponse obtener(@PathVariable Long id) {
        return planMembresiaService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<PlanMembresiaResponse> crear(@Valid @RequestBody PlanMembresiaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(planMembresiaService.crear(request));
    }

    @PutMapping("/{id}")
    public PlanMembresiaResponse actualizar(@PathVariable Long id, @Valid @RequestBody PlanMembresiaRequest request) {
        return planMembresiaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        planMembresiaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
