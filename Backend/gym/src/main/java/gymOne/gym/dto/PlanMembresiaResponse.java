package gymOne.gym.dto;

import java.math.BigDecimal;
import java.util.List;

public record PlanMembresiaResponse(
        Long id,
        String nombre,
        Integer duracionDias,
        BigDecimal precio,
        List<String> beneficios,
        boolean activo) {
}
