package gymOne.gym.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record GastoRequest(
        @NotBlank String categoria,
        @NotBlank String descripcion,
        @NotNull @Positive BigDecimal monto) {
}
