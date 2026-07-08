package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TendenciaDiaResponse(
        LocalDate fecha,
        BigDecimal ingresos,
        long asistencias) {
}
