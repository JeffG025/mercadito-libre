package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.DetalleVentaEntity;
import com.example.mercaditolibre.repository.DetalleVentaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DetalleVentaService {
    private final DetalleVentaRepository detalleVentaRepository;

    public List<DetalleVentaEntity> getAllDetalles() {
        return detalleVentaRepository.findAll();
    }

    public DetalleVentaEntity getDetalleById(long id) {
        return detalleVentaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Detalle de venta no encontrado: " + id));
    }

    public DetalleVentaEntity createDetalle(DetalleVentaEntity detalle) {
        if (detalle.getCantidad() <= 0) {
            throw new BadRequestException("La cantidad del detalle debe ser mayor a 0");
        }
        return detalleVentaRepository.save(detalle);
    }

    public DetalleVentaEntity updateDetalle(long id, DetalleVentaEntity detalle) {
        DetalleVentaEntity existing = detalleVentaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Detalle de venta no encontrado: " + id));
        existing.setCantidad(detalle.getCantidad());
        existing.setPrecioUnitario(detalle.getPrecioUnitario());
        existing.setSubtotal(detalle.getSubtotal());
        existing.setProducto(detalle.getProducto());
        existing.setVenta(detalle.getVenta());
        return detalleVentaRepository.save(existing);
    }

    public void deleteDetalle(long id) {
        DetalleVentaEntity existing = detalleVentaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Detalle de venta no encontrado: " + id));
        detalleVentaRepository.delete(existing);
    }
}
