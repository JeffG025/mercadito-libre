package com.example.mercaditolibre.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Cambio de contraseña. Exige la actual: si no, un token robado bastaría para secuestrar la cuenta.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CambiarPasswordRequest {

    @NotBlank(message = "La contraseña actual es obligatoria")
    private String passwordActual;

    @NotBlank(message = "La contraseña nueva es obligatoria")
    @Size(min = 6, message = "La contraseña nueva debe tener al menos 6 caracteres")
    private String passwordNueva;
}
