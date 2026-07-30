package com.example.mercaditolibre.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Imagen de un producto, en tabla aparte para que listar el catálogo no arrastre los bytes.
// La PK es el id del producto: un producto tiene como mucho una imagen.
@Entity
@Table(name = "producto_imagenes")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class ProductoImagenEntity {

    @Id
    @Column(name = "producto_id")
    private Long productoId;

    @Lob
    @Column(name = "datos", nullable = false, columnDefinition = "LONGBLOB")
    private byte[] datos;

    // MIME del archivo (image/png, image/jpeg…), para devolverlo en el Content-Type.
    @Column(name = "tipo", nullable = false, length = 100)
    private String tipo;

    // Marca de tiempo de la última subida. Va en la URL para romper la caché del navegador.
    @Column(name = "version", nullable = false)
    private long version;
}
