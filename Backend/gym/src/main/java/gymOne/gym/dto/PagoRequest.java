package gymOne.gym.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record PagoRequest(
        @NotNull Long clienteId,
        Long suscripcionId,
        @NotBlank String tipo,
        @NotBlank String metodo,
        @NotNull @Positive BigDecimal monto,
        String nota) {
}
