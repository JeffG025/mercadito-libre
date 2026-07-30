package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Credenciales del login.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    private String username;
    private String password;
}
