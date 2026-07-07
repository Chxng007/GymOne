package gymOne.gym.dto;

import java.math.BigDecimal;

public record ProductoResponse(
        Long id,
        String nombre,
        String categoria,
        BigDecimal costo,
        BigDecimal precio,
        Integer stock,
        String proveedor) {
}
