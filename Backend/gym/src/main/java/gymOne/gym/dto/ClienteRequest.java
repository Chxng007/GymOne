package gymOne.gym.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

public record ClienteRequest(
        String fotoUrl,
        @NotBlank String primerNombre,
        String segundoNombre,
        @NotBlank String documento,
        @NotNull @Past LocalDate fechaNacimiento,
        @NotBlank String telefono,
        String correo,
        String direccion,
        String contactoEmergenciaNombre,
        String contactoEmergenciaTelefono,
        String eps,
        String observaciones,
        Double pesoKg,
        Double alturaCm,
        String objetivo,
        String estado) {
}
