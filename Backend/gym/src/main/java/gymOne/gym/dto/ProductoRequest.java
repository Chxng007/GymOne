package gymOne.gym.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record ProductoRequest(
        @NotBlank String nombre,
        @NotBlank String categoria,
        @NotNull @PositiveOrZero BigDecimal costo,
        @NotNull @PositiveOrZero BigDecimal precio,
        @NotNull @PositiveOrZero Integer stock,
        String proveedor) {
}
