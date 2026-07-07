package gymOne.gym.dto;

public record RutinaEjercicioResponse(
        Long id,
        String ejercicio,
        Integer series,
        Integer repeticiones,
        Double peso,
        Integer descansoSegundos,
        String notas,
        String videoUrl) {
}
