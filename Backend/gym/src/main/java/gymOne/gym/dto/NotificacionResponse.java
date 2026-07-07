package gymOne.gym.dto;

import java.time.LocalDateTime;

public record NotificacionResponse(
        Long id,
        String tipo,
        String mensaje,
        boolean leida,
        Long clienteRelacionadoId,
        LocalDateTime createdAt) {
}
