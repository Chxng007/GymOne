package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record GastoResponse(
        Long id,
        String categoria,
        String descripcion,
        BigDecimal monto,
        LocalDate fecha) {
}
