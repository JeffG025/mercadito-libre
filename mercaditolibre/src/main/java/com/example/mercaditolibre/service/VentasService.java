package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.VentasEntity;
import com.example.mercaditolibre.repository.VentasRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class VentasService {
    private final VentasRepository ventasRepository;

    public List<VentasEntity> getAllVentas() {
        return ventasRepository.findAll();
    }

    // Ventas del usuario autenticado (para Mis Compras).
    public List<VentasEntity> getVentasByUsername(String username) {
        return ventasRepository.findByUsername(username);
    }

    public VentasEntity getVentaById(long id) {
        return ventasRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));
    }

    // Usado por PagoController para el flujo de Stripe.
    public VentasEntity obtenerPorId(Long id) {
        return getVentaById(id);
    }

    // Marca la venta como pagada tras confirmar el pago con Stripe.
    public VentasEntity confirmarPago(Long idVenta) {
        VentasEntity venta = getVentaById(idVenta);
        venta.setEstadoPago("Pagado");
        return ventasRepository.save(venta);
    }

    public VentasEntity createVenta(VentasEntity venta) {
        if (venta.getTotal() < 0) {
            throw new BadRequestException("El total de la venta no puede ser negativo");
        }
        if (venta.getEstadoPago() == null || venta.getEstadoPago().isEmpty()) {
            throw new BadRequestException("El estado de pago de la venta es obligatorio");
        }
        if (venta.getDetalles() != null) {
            venta.getDetalles().forEach(detalle -> detalle.setVenta(venta));
        }
        return ventasRepository.save(venta);
    }

    public VentasEntity updateVenta(long id, VentasEntity venta) {
        VentasEntity existingVenta = ventasRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada: " + id));
        existingVenta.setFecha(venta.getFecha());
        existingVenta.setTotal(venta.getTotal());
        existingVenta.setEstadoPago(venta.getEstadoPago());
        existingVenta.setCliente(venta.getCliente());
        return ventasRepository.save(existingVenta);
    }
}
