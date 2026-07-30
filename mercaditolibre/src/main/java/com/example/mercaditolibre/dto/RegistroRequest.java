package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Datos para crear una cuenta. El campo rol se ignora: el registro siempre crea clientes.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class RegistroRequest {
    private String username;
    private String password;
    private String nombre;
    private String email;
    private String direccion;
    private String rol;
}
