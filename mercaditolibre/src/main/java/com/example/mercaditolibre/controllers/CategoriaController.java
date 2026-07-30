package com.example.mercaditolibre.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mercaditolibre.models.CategoriaEntity;
import com.example.mercaditolibre.service.CategoriaService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/categorias")
@RequiredArgsConstructor
public class CategoriaController {
    private final CategoriaService servicio;

    @GetMapping
    public ResponseEntity<List<CategoriaEntity>> listar() {
        return ResponseEntity.ok(servicio.getAllCategorias());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<CategoriaEntity>> listarActivas() {
        return ResponseEntity.ok(servicio.getAllCategoriasActivas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaEntity> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.getCategoriaById(id));
    }

    @PostMapping
    public ResponseEntity<CategoriaEntity> crear(@Valid @RequestBody CategoriaEntity categoria) {
        return new ResponseEntity<>(servicio.createCategoria(categoria), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoriaEntity> actualizar(@PathVariable Long id, @Valid @RequestBody CategoriaEntity categoria) {
        return ResponseEntity.ok(servicio.updateCategoria(id, categoria));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.deleteCategoria(id);
        return ResponseEntity.noContent().build();
    }
}
