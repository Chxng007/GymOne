package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PagoResponse(
        Long id,
        Long clienteId,
        String clienteNombre,
        Long suscripcionId,
        String tipo,
        String metodo,
        BigDecimal monto,
        LocalDateTime fecha,
        String registradoPorNombre,
        String nota,
        boolean notificado,
        boolean clienteTieneCorreo) {
}
