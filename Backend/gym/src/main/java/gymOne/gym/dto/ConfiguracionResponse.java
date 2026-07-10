package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalTime;

public record ConfiguracionResponse(
        Long id,
        String nombre,
        String logoUrl,
        String direccion,
        String telefono,
        String moneda,
        BigDecimal impuestoPorcentaje,
        LocalTime horarioApertura,
        LocalTime horarioCierre,
        BigDecimal metaIngresosMensual) {
}
