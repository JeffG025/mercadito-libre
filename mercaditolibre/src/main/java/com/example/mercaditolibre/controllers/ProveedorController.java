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

import com.example.mercaditolibre.models.ProveedorEntity;
import com.example.mercaditolibre.service.ProovedorService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/proveedores")
@RequiredArgsConstructor
public class ProveedorController {
    private final ProovedorService servicio;

    @GetMapping
    public ResponseEntity<List<ProveedorEntity>> listar() {
        return ResponseEntity.ok(servicio.getAllProveedores());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<ProveedorEntity>> listarActivos() {
        return ResponseEntity.ok(servicio.getAllProveedoresActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProveedorEntity> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.getProveedorById(id));
    }

    @PostMapping
    public ResponseEntity<ProveedorEntity> crear(@Valid @RequestBody ProveedorEntity proveedor) {
        return new ResponseEntity<>(servicio.createProveedor(proveedor), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProveedorEntity> actualizar(@PathVariable Long id, @Valid @RequestBody ProveedorEntity proveedor) {
        return ResponseEntity.ok(servicio.updateProveedor(id, proveedor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.deleteProveedor(id);
        return ResponseEntity.noContent().build();
    }
}
