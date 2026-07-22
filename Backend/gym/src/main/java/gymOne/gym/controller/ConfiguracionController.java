package gymOne.gym.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import gymOne.gym.dto.ConfiguracionRequest;
import gymOne.gym.dto.ConfiguracionResponse;
import gymOne.gym.service.ConfiguracionService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    public ConfiguracionController(ConfiguracionService configuracionService) {
        this.configuracionService = configuracionService;
    }

    @GetMapping
    public ConfiguracionResponse obtener() {
        return configuracionService.obtener();
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ConfiguracionResponse actualizar(@Valid @RequestBody ConfiguracionRequest request) {
        return configuracionService.actualizar(request);
    }
}
