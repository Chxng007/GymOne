package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CajaMovimientoResponse(
        Long id,
        String tipo,
        String concepto,
        BigDecimal monto,
        LocalDateTime fecha) {
}
