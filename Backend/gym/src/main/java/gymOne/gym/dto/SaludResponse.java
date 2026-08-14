package gymOne.gym.dto;

public record SaludResponse(
        /** "ok" cuando la aplicación atiende peticiones. */
        String estado,
        /** "ok" o "error" según responda la base de datos. */
        String bd) {
}
