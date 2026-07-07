package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;

public record ConfiguracionRequest(
        @NotBlank String nombre,
        String logoUrl,
        String direccion,
        String telefono,
        @NotBlank String moneda,
        BigDecimal impuestoPorcentaje,
        LocalTime horarioApertura,
        LocalTime horarioCierre) {
}
