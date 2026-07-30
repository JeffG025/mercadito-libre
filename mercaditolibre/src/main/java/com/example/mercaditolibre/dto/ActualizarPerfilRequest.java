package com.example.mercaditolibre.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Cambios que un usuario puede hacer sobre sus propios datos.
// El username NO está aquí a propósito: identifica la cuenta y las ventas lo referencian.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ActualizarPerfilRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    private String email;

    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    private String direccion;
}
