package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VentaResponse(
        Long id,
        LocalDateTime fecha,
        BigDecimal total,
        BigDecimal descuento,
        String metodoPago,
        String registradoPorNombre,
        List<VentaItemResponse> items) {
}
