package gymOne.gym.dto;

public record LoginResponse(
        String token,
        String nombre,
        String correo,
        String rol,
        /** La sesión es de invitado: el backend le rechaza cualquier escritura. */
        boolean invitado) {
}
