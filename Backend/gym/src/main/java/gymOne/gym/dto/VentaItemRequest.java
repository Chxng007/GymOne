package gymOne.gym.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record VentaItemRequest(
        @NotNull Long productoId,
        @NotNull @Positive Integer cantidad) {
}
