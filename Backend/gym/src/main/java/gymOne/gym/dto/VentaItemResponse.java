package gymOne.gym.dto;

import java.math.BigDecimal;

public record VentaItemResponse(
        Long productoId,
        String productoNombre,
        Integer cantidad,
        BigDecimal precioUnitario,
        BigDecimal subtotal) {
}
