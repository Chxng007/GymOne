package gymOne.gym.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record RutinaRequest(
        @NotNull Long clienteId,
        Long entrenadorId,
        @NotBlank String nombre,
        LocalDate fechaInicio,
        @NotEmpty @Valid List<RutinaDiaRequest> dias) {
}
