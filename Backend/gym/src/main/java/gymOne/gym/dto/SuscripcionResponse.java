package gymOne.gym.dto;

import java.time.LocalDate;

public record SuscripcionResponse(
        Long id,
        Long clienteId,
        String clienteNombre,
        Long planId,
        String planNombre,
        LocalDate fechaInicio,
        LocalDate fechaFin,
        String estado,
        LocalDate congeladaDesde) {
}
