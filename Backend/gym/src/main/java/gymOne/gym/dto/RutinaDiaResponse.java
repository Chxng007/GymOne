package gymOne.gym.dto;

import java.util.List;

public record RutinaDiaResponse(
        Long id,
        String dia,
        List<RutinaEjercicioResponse> ejercicios) {
}
