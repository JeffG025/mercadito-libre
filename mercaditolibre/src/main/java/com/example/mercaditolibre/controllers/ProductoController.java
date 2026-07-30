package com.example.mercaditolibre.controllers;

import java.time.Duration;
import java.util.List;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.mercaditolibre.models.ProductoEntity;
import com.example.mercaditolibre.models.ProductoImagenEntity;
import com.example.mercaditolibre.service.ProductoImagenService;
import com.example.mercaditolibre.service.ProductoService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService servicio;
    private final ProductoImagenService imagenServicio;

    @GetMapping
    public ResponseEntity<List<ProductoEntity>> listar() {
        return ResponseEntity.ok(servicio.getAllProductos());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<ProductoEntity>> listarActivos() {
        return ResponseEntity.ok(servicio.getAllProductosActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductoEntity> obtenerDetalles(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.getProductoById(id));
    }

    @PostMapping
    public ResponseEntity<ProductoEntity> crear(@Valid @RequestBody ProductoEntity producto) {
        return new ResponseEntity<>(servicio.createProducto(producto), HttpStatus.CREATED); // 201 Created
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductoEntity> actualizar(@PathVariable Long id, @Valid @RequestBody ProductoEntity producto) {
        return ResponseEntity.ok(servicio.updateProducto(id, producto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.deleteProducto(id);
        return ResponseEntity.noContent().build(); // 204 no content
    }

    // Reactiva un producto dado de baja. PUT -> queda protegido como ADMIN en SecurityConfig.
    @PutMapping("/{id}/activar")
    public ResponseEntity<ProductoEntity> activar(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.reactivarProducto(id));
    }

    // --- Imagen del producto ---
    // Los permisos los hereda de SecurityConfig: GET público, POST y DELETE solo ADMIN.

    @PostMapping("/{id}/imagen")
    public ResponseEntity<ProductoEntity> subirImagen(@PathVariable Long id,
                                                     @RequestParam("archivo") MultipartFile archivo) {
        return ResponseEntity.ok(imagenServicio.guardar(id, archivo));
    }

    @GetMapping("/{id}/imagen")
    public ResponseEntity<byte[]> obtenerImagen(@PathVariable Long id) {
        ProductoImagenEntity imagen = imagenServicio.obtener(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(imagen.getTipo()))
                // La URL cambia con cada subida, así que el archivo en sí puede cachearse largo.
                .cacheControl(CacheControl.maxAge(Duration.ofDays(30)).cachePublic())
                .body(imagen.getDatos());
    }

    @DeleteMapping("/{id}/imagen")
    public ResponseEntity<ProductoEntity> eliminarImagen(@PathVariable Long id) {
        return ResponseEntity.ok(imagenServicio.eliminar(id));
    }
}
