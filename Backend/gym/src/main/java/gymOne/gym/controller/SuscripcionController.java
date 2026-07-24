package gymOne.gym.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.SuscripcionRequest;
import gymOne.gym.dto.SuscripcionResponse;
import gymOne.gym.service.SuscripcionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/suscripciones")
public class SuscripcionController {

    private final SuscripcionService suscripcionService;

    public SuscripcionController(SuscripcionService suscripcionService) {
        this.suscripcionService = suscripcionService;
    }

    @GetMapping
    public List<SuscripcionResponse> listar(@RequestParam(required = false) Long clienteId) {
        return suscripcionService.listar(clienteId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
    public ResponseEntity<SuscripcionResponse> crear(@Valid @RequestBody SuscripcionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(suscripcionService.crear(request));
    }

    @PostMapping("/{id}/congelar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
    public SuscripcionResponse congelar(@PathVariable Long id) {
        return suscripcionService.congelar(id);
    }

    @PostMapping("/{id}/renovar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
    public SuscripcionResponse renovar(@PathVariable Long id) {
        return suscripcionService.renovar(id);
    }
}
