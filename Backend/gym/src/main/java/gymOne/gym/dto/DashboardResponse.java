package gymOne.gym.dto;

import java.math.BigDecimal;

public record DashboardResponse(
        long clientesActivos,
        long clientesVencidos,
        BigDecimal ingresosHoy,
        BigDecimal ingresosMes,
        long nuevosClientes,
        long renovaciones,
        long asistenciaHoy,
        int productosVendidos,
        BigDecimal gananciaMensual,
        boolean cajaAbierta,
        BigDecimal cajaSaldoActual) {
}
