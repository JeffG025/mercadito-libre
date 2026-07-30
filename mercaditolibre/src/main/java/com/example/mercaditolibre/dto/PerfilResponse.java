package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// Datos del usuario para su ventana de perfil. Nunca incluye la contraseña.
@Getter @AllArgsConstructor
public class PerfilResponse {
    private Long id;
    private String username;
    private String nombre;
    private String email;
    private String direccion;
    private String role;
}
