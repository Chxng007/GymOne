package gymOne.gym.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.AsistenciaResponse;
import gymOne.gym.service.AsistenciaService;

@RestController
@RequestMapping("/api/asistencias")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @GetMapping
    public List<AsistenciaResponse> listar(@RequestParam(required = false) Long clienteId) {
        return clienteId != null ? asistenciaService.listarPorCliente(clienteId) : asistenciaService.listarHoy();
    }

    @PostMapping("/entrada")
    public ResponseEntity<AsistenciaResponse> registrarEntrada(@RequestParam Long clienteId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(asistenciaService.registrarEntrada(clienteId));
    }

    @PostMapping("/{id}/salida")
    public AsistenciaResponse registrarSalida(@PathVariable Long id) {
        return asistenciaService.registrarSalida(id);
    }
}
