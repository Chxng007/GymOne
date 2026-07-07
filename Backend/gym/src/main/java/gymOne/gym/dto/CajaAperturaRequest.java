package gymOne.gym.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CajaAperturaRequest(
        @NotNull @PositiveOrZero BigDecimal saldoInicial) {
}
