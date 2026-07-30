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

import com.example.mercaditolibre.models.DetalleVentaEntity;
import com.example.mercaditolibre.service.DetalleVentaService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/detalles")
@RequiredArgsConstructor
public class DetalleVentaController {
    private final DetalleVentaService servicio;

    @GetMapping
    public ResponseEntity<List<DetalleVentaEntity>> listar() {
        return ResponseEntity.ok(servicio.getAllDetalles());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DetalleVentaEntity> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.getDetalleById(id));
    }

    @PostMapping
    public ResponseEntity<DetalleVentaEntity> crear(@RequestBody DetalleVentaEntity detalle) {
        return new ResponseEntity<>(servicio.createDetalle(detalle), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DetalleVentaEntity> actualizar(@PathVariable Long id, @RequestBody DetalleVentaEntity detalle) {
        return ResponseEntity.ok(servicio.updateDetalle(id, detalle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.deleteDetalle(id);
        return ResponseEntity.noContent().build();
    }
}
