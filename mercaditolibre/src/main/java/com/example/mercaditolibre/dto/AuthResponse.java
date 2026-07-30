package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Respuesta del login: token JWT y datos básicos del usuario.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String nombre;
    private String role;
}
