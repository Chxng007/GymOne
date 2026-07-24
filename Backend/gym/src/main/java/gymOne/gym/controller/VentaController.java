package gymOne.gym.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.VentaRequest;
import gymOne.gym.dto.VentaResponse;
import gymOne.gym.service.VentaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ventas")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
public class VentaController {

    private final VentaService ventaService;

    public VentaController(VentaService ventaService) {
        this.ventaService = ventaService;
    }

    @GetMapping
    public List<VentaResponse> listar() {
        return ventaService.listar();
    }

    @PostMapping
    public ResponseEntity<VentaResponse> crear(@Valid @RequestBody VentaRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ventaService.crear(request, authentication.getName()));
    }
}
