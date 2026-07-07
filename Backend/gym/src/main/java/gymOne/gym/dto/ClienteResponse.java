package gymOne.gym.dto;

import java.time.LocalDate;

public record ClienteResponse(
        Long id,
        String fotoUrl,
        String primerNombre,
        String segundoNombre,
        String documento,
        LocalDate fechaNacimiento,
        Integer edad,
        String telefono,
        String correo,
        String direccion,
        String contactoEmergenciaNombre,
        String contactoEmergenciaTelefono,
        String eps,
        String observaciones,
        Double pesoKg,
        Double alturaCm,
        Double imc,
        String objetivo,
        String estado) {
}
