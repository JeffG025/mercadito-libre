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
@Table(name = "proveedores")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder

public class ProveedorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "El nombre del proveedor es obligatorio")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @NotBlank(message = "El email del proveedor es obligatorio")
    @Email(message = "El email no tiene un formato válido")
    @Column(name = "email", nullable = false, length = 100)
    private String email;

    @Column(name = "telefono", nullable = true, length = 20)
    private String telefono;

    @Column(name = "direccion", nullable = true, length = 200)
    private String direccion;

    @Column(name = "activo", nullable = false)
    private boolean activo;


}
