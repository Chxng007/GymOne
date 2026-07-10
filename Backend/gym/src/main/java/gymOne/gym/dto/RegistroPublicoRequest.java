package gymOne.gym.dto;

import java.time.LocalDate;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;

public record RegistroPublicoRequest(
        @NotBlank String primerNombre,
        @NotBlank String segundoNombre,
        @NotBlank String documento,
        @NotNull @Past LocalDate fechaNacimiento,
        @NotBlank String telefono,
        @NotBlank String correo,
        @NotBlank String direccion,
        @NotBlank String contactoEmergenciaNombre,
        @NotBlank String contactoEmergenciaTelefono,
        @NotBlank String eps,
        @NotNull Double pesoKg,
        @NotNull Double alturaCm,
        @NotBlank String objetivo) {
}
