package gymOne.gym.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record RutinaDiaRequest(
        @NotBlank String dia,
        @NotEmpty @Valid List<RutinaEjercicioRequest> ejercicios) {
}
