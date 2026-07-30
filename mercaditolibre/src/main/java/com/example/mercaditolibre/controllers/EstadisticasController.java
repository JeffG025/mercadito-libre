package com.example.mercaditolibre.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mercaditolibre.dto.EstadisticasResponse;
import com.example.mercaditolibre.service.EstadisticasService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/estadisticas")
@RequiredArgsConstructor
public class EstadisticasController {
    private final EstadisticasService servicio;

    // Métricas del panel admin. Hoy devuelve ceros.
    @GetMapping
    public ResponseEntity<EstadisticasResponse> obtener() {
        return ResponseEntity.ok(servicio.obtener());
    }
}
