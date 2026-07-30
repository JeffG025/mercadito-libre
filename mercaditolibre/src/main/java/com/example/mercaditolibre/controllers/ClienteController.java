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

import com.example.mercaditolibre.models.ClienteEntity;
import com.example.mercaditolibre.service.ClienteService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/clientes")
@RequiredArgsConstructor
public class ClienteController {
    private final ClienteService servicio;

    @GetMapping
    public ResponseEntity<List<ClienteEntity>> listar() {
        return ResponseEntity.ok(servicio.getAllClientes());
    }

    @GetMapping("/activos")
    public ResponseEntity<List<ClienteEntity>> listarActivos() {
        return ResponseEntity.ok(servicio.getAllClientesActivos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteEntity> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.getClienteById(id));
    }

    @PostMapping
    public ResponseEntity<ClienteEntity> crear(@Valid @RequestBody ClienteEntity cliente) {
        return new ResponseEntity<>(servicio.createCliente(cliente), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteEntity> actualizar(@PathVariable Long id, @Valid @RequestBody ClienteEntity cliente) {
        return ResponseEntity.ok(servicio.updateCliente(id, cliente));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        servicio.deleteCliente(id);
        return ResponseEntity.noContent().build();
    }
}
