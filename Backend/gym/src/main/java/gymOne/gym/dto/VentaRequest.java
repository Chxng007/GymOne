package gymOne.gym.dto;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.PositiveOrZero;

public record VentaRequest(
        @NotEmpty @Valid List<VentaItemRequest> items,
        @PositiveOrZero BigDecimal descuento,
        @NotBlank String metodoPago) {
}
