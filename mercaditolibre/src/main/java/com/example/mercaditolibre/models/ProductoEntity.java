package com.example.mercaditolibre.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@Entity
@Table(name = "productos")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder

public class ProductoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "El nombre del producto es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "descripcion", nullable = true)
    private String descripcion;

    @Positive(message = "El precio debe ser mayor a cero")
    @Column(name = "precio", nullable = false)
    private double precio;

    @PositiveOrZero(message = "El stock no puede ser negativo")
    @Column(name = "stock", nullable = false)
    private int stock;

    @Column(name = "imagen_url", nullable = true)
    private String imagenUrl;

    @Column (name = "activo", nullable = false)
    private boolean activo;

    // Opcionales, sin @NotNull: se puede crear un producto sin categoría ni proveedor.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "categorias_id")
    private CategoriaEntity categoria;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proveedor_id")
    private ProveedorEntity proveedor;
}
