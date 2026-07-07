package gymOne.gym.dto;

import java.time.LocalDate;
import java.util.List;

public record RutinaResponse(
        Long id,
        Long clienteId,
        Long entrenadorId,
        String entrenadorNombre,
        String nombre,
        LocalDate fechaInicio,
        List<RutinaDiaResponse> dias) {
}
