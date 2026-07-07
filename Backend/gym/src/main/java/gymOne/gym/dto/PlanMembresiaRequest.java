package gymOne.gym.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PlanMembresiaRequest(
        @NotBlank String nombre,
        @NotNull @Positive Integer duracionDias,
        @NotNull @Positive BigDecimal precio,
        List<String> beneficios,
        Boolean activo) {
}
