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

import gymOne.gym.dto.RutinaRequest;
import gymOne.gym.dto.RutinaResponse;
import gymOne.gym.service.RutinaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/rutinas")
public class RutinaController {

    private final RutinaService rutinaService;

    public RutinaController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    @GetMapping
    public List<RutinaResponse> listarPorCliente(@RequestParam Long clienteId) {
        return rutinaService.listarPorCliente(clienteId);
    }

    @GetMapping("/{id}")
    public RutinaResponse obtener(@PathVariable Long id) {
        return rutinaService.obtener(id);
    }

    @PostMapping
    public ResponseEntity<RutinaResponse> crear(@Valid @RequestBody RutinaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(rutinaService.crear(request));
    }

    @PutMapping("/{id}")
    public RutinaResponse actualizar(@PathVariable Long id, @Valid @RequestBody RutinaRequest request) {
        return rutinaService.actualizar(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        rutinaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
