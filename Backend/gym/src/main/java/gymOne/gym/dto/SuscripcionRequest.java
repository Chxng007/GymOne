package gymOne.gym.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotNull;

public record SuscripcionRequest(
        @NotNull Long clienteId,
        @NotNull Long planId,
        LocalDate fechaInicio) {
}
