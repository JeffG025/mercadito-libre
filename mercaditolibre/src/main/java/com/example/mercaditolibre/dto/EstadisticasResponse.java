package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Métricas del panel admin.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EstadisticasResponse {
    private double totalRecaudado;
    private long totalCategorias;
    private long totalOrdenes;
    private long productosActivos;
}
