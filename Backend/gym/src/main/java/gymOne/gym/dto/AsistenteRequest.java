package gymOne.gym.dto;

import jakarta.validation.constraints.NotBlank;

public record AsistenteRequest(@NotBlank String pregunta) {
}
