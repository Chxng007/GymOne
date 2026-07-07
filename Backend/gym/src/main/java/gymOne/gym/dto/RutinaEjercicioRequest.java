package gymOne.gym.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record RutinaEjercicioRequest(
        @NotBlank String ejercicio,
        @NotNull @Positive Integer series,
        @NotNull @Positive Integer repeticiones,
        Double peso,
        Integer descansoSegundos,
        String notas,
        String videoUrl) {
}
