package com.example.mercaditolibre.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Alta de usuario desde el panel de administración. Aquí sí se respeta el rol pedido,
// a diferencia del registro público, que siempre crea clientes.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class CrearUsuarioRequest {

    @NotBlank(message = "El usuario es obligatorio")
    @Size(max = 50, message = "El usuario no puede superar los 50 caracteres")
    private String username;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @Email(message = "El correo no tiene un formato válido")
    @Size(max = 100, message = "El correo no puede superar los 100 caracteres")
    private String email;

    @Size(max = 200, message = "La dirección no puede superar los 200 caracteres")
    private String direccion;

    // ROLE_ADMIN o ROLE_CLIENTE. Si viene vacío se crea cliente.
    private String rol;
}
