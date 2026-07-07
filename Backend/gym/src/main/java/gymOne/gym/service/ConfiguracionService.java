package gymOne.gym.service;

import java.math.BigDecimal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import gymOne.gym.dto.ConfiguracionRequest;
import gymOne.gym.dto.ConfiguracionResponse;
import gymOne.gym.entity.ConfiguracionGimnasio;
import gymOne.gym.repository.ConfiguracionGimnasioRepository;

@Service
@Transactional
public class ConfiguracionService {

    private final ConfiguracionGimnasioRepository configuracionRepository;

    public ConfiguracionService(ConfiguracionGimnasioRepository configuracionRepository) {
        this.configuracionRepository = configuracionRepository;
    }

    public ConfiguracionResponse obtener() {
        return toResponse(obtenerOCrear());
    }

    public ConfiguracionResponse actualizar(ConfiguracionRequest request) {
        ConfiguracionGimnasio config = obtenerOCrear();
        config.setNombre(request.nombre());
        config.setLogoUrl(request.logoUrl());
        config.setDireccion(request.direccion());
        config.setTelefono(request.telefono());
        config.setMoneda(request.moneda());
        config.setImpuestoPorcentaje(request.impuestoPorcentaje() != null ? request.impuestoPorcentaje() : BigDecimal.ZERO);
        config.setHorarioApertura(request.horarioApertura());
        config.setHorarioCierre(request.horarioCierre());
        return toResponse(configuracionRepository.save(config));
    }

    private ConfiguracionGimnasio obtenerOCrear() {
        return configuracionRepository.findAll().stream().findFirst().orElseGet(() -> {
            ConfiguracionGimnasio nueva = new ConfiguracionGimnasio();
            nueva.setNombre("GymOne");
            return configuracionRepository.save(nueva);
        });
    }

    private ConfiguracionResponse toResponse(ConfiguracionGimnasio config) {
        return new ConfiguracionResponse(
                config.getId(),
                config.getNombre(),
                config.getLogoUrl(),
                config.getDireccion(),
                config.getTelefono(),
                config.getMoneda(),
                config.getImpuestoPorcentaje(),
                config.getHorarioApertura(),
                config.getHorarioCierre());
    }
}
