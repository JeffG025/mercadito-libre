package com.example.mercaditolibre.models;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
@Table(name = "clientes")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder

public class ClienteEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "El nombre del cliente es obligatorio")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El apellido del cliente es obligatorio")
    @Column(name = "apellido", nullable = false, length = 100)
    private String apellido;

    @NotBlank(message = "El email del cliente es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Column(name = "email", nullable = false, length = 100, unique = true)
    private String email;

    @Column(name = "telefono", nullable = true, length = 20)
    private String telefono;

    @Column (name = "activo", nullable = false)
    private boolean activo;
}
