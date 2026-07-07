package gymOne.gym.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.PagoRequest;
import gymOne.gym.dto.PagoResponse;
import gymOne.gym.service.PagoService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/pagos")
public class PagoController {

    private final PagoService pagoService;

    public PagoController(PagoService pagoService) {
        this.pagoService = pagoService;
    }

    @GetMapping
    public List<PagoResponse> listar(@RequestParam(required = false) Long clienteId) {
        return pagoService.listar(clienteId);
    }

    @PostMapping
    public ResponseEntity<PagoResponse> crear(@Valid @RequestBody PagoRequest request, Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED).body(pagoService.crear(request, authentication.getName()));
    }
}
