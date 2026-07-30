package com.example.mercaditolibre.controllers;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mercaditolibre.models.VentasEntity;
import com.example.mercaditolibre.service.VentasService;
import com.example.mercaditolibre.service.ProcesarVenta;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/ventas")
@RequiredArgsConstructor
public class VentasController {
    private final VentasService servicio;
    private final ProcesarVenta procesarVenta;

    @GetMapping
    public ResponseEntity<List<VentasEntity>> listar() {
        return ResponseEntity.ok(servicio.getAllVentas());
    }

    // Ventas del usuario autenticado. principal.getName() es el username del token.
    @GetMapping("/mias")
    public ResponseEntity<List<VentasEntity>> misVentas(Principal principal) {
        return ResponseEntity.ok(servicio.getVentasByUsername(principal.getName()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<VentasEntity> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(servicio.getVentaById(id));
    }

    @PostMapping
    public ResponseEntity<VentasEntity> crear(@RequestBody VentasEntity venta) {
        return new ResponseEntity<>(servicio.createVenta(venta), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VentasEntity> actualizar(@PathVariable Long id, @RequestBody VentasEntity venta) {
        return ResponseEntity.ok(servicio.updateVenta(id, venta));
    }

    // Valida stock, calcula totales y descuenta stock en una transacción.
    // Asigna el username del token para que la compra aparezca en Mis Compras.
    @PostMapping("/procesar")
    public ResponseEntity<VentasEntity> procesar(@RequestBody VentasEntity venta, Principal principal) {
        venta.setUsername(principal.getName());
        return new ResponseEntity<>(procesarVenta.procesar(venta), HttpStatus.CREATED);
    }
}
