package gymOne.gym.dto;

import jakarta.validation.constraints.NotBlank;

public record EntrenadorRequest(
        @NotBlank String nombre,
        @NotBlank String telefono,
        @NotBlank String especialidad,
        String horario) {
}
