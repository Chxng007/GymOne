package gymOne.gym.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CajaMovimientoRequest(
        @NotBlank String tipo,
        @NotBlank String concepto,
        @NotNull @Positive BigDecimal monto) {
}
