package gymOne.gym.dto;

public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        String rol) {
}
