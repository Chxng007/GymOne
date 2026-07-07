package gymOne.gym.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AsistenciaResponse(
        Long id,
        Long clienteId,
        String clienteNombre,
        LocalDateTime horaEntrada,
        LocalDateTime horaSalida,
        LocalDate fecha) {
}
