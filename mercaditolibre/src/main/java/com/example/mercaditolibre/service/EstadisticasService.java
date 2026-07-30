package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.dto.EstadisticasResponse;
import com.example.mercaditolibre.models.ProductoEntity;
import com.example.mercaditolibre.models.VentasEntity;
import com.example.mercaditolibre.repository.CategoriaRepository;
import com.example.mercaditolibre.repository.ProductoRepository;
import com.example.mercaditolibre.repository.VentasRepository;

import lombok.RequiredArgsConstructor;

// Calcula las métricas del panel admin.
@Service
@RequiredArgsConstructor
public class EstadisticasService {

    private final VentasRepository ventasRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    public EstadisticasResponse obtener() {
        List<VentasEntity> ventas = ventasRepository.findAll();
        double totalRecaudado = ventas.stream().mapToDouble(VentasEntity::getTotal).sum();
        long totalOrdenes = ventas.size();
        long totalCategorias = categoriaRepository.count();
        long productosActivos = productoRepository.findAll().stream()
                .filter(ProductoEntity::isActivo).count();
        return new EstadisticasResponse(totalRecaudado, totalCategorias, totalOrdenes, productosActivos);
    }
}
