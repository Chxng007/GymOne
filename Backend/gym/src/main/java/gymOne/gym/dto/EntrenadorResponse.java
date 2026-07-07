package gymOne.gym.dto;

public record EntrenadorResponse(
        Long id,
        String nombre,
        String telefono,
        String especialidad,
        String horario) {
}
