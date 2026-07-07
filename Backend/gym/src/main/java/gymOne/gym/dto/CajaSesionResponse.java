package gymOne.gym.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record CajaSesionResponse(
        Long id,
        LocalDate fecha,
        LocalDateTime horaApertura,
        LocalDateTime horaCierre,
        BigDecimal saldoInicial,
        BigDecimal saldoFinal,
        BigDecimal totalIngresos,
        BigDecimal totalEgresos,
        BigDecimal saldoActual,
        String responsableNombre,
        String estado,
        List<CajaMovimientoResponse> movimientos) {
}
