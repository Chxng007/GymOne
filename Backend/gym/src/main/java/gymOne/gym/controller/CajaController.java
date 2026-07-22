package gymOne.gym.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.CajaAperturaRequest;
import gymOne.gym.dto.CajaMovimientoRequest;
import gymOne.gym.dto.CajaMovimientoResponse;
import gymOne.gym.dto.CajaSesionResponse;
import gymOne.gym.service.CajaService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/caja")
@PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")
public class CajaController {

    private final CajaService cajaService;

    public CajaController(CajaService cajaService) {
        this.cajaService = cajaService;
    }

    @GetMapping("/actual")
    public CajaSesionResponse actual() {
        return cajaService.obtenerActual();
    }

    @GetMapping("/sesiones")
    public List<CajaSesionResponse> historial() {
        return cajaService.historial();
    }

    @PostMapping("/abrir")
    public ResponseEntity<CajaSesionResponse> abrir(@Valid @RequestBody CajaAperturaRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(cajaService.abrir(request.saldoInicial(), authentication.getName()));
    }

    @PostMapping("/{id}/movimientos")
    public ResponseEntity<CajaMovimientoResponse> registrarMovimiento(
            @PathVariable Long id, @Valid @RequestBody CajaMovimientoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cajaService.registrarMovimiento(id, request));
    }

    @PostMapping("/{id}/cerrar")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public CajaSesionResponse cerrar(@PathVariable Long id) {
        return cajaService.cerrar(id);
    }
}
