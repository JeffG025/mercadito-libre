package com.example.mercaditolibre.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.DetalleVentaEntity;
import com.example.mercaditolibre.models.ProductoEntity;
import com.example.mercaditolibre.models.VentasEntity;
import com.example.mercaditolibre.repository.ProductoRepository;
import com.example.mercaditolibre.repository.VentasRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

// Valida la venta, descuenta stock, calcula subtotales y total, y la persiste con sus detalles.
@Service
@RequiredArgsConstructor
public class ProcesarVenta {

    private final VentasRepository ventasRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public VentasEntity procesar(VentasEntity venta) {
        // Exige al menos un detalle.
        if (venta.getDetalles() == null || venta.getDetalles().isEmpty()) {
            throw new BadRequestException("La venta debe incluir al menos un producto");
        }

        // Cabecera. Nace "Pendiente"; el pago la pasa a "Pagado" (confirmarPago).
        venta.setFecha(LocalDate.now());
        venta.setEstadoPago("Pendiente");

        double total = 0.0;

        // Por cada detalle: valida, descuenta stock y calcula subtotal.
        for (DetalleVentaEntity detalle : venta.getDetalles()) {
            if (detalle.getProducto() == null || detalle.getProducto().getId() == null) {
                throw new BadRequestException("Cada detalle debe referenciar un producto con id");
            }
            if (detalle.getCantidad() <= 0) {
                throw new BadRequestException("La cantidad de cada producto debe ser mayor a 0");
            }

            ProductoEntity producto = productoRepository.findById(detalle.getProducto().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Producto no encontrado con ID: " + detalle.getProducto().getId()));

            // Rechaza los productos dados de baja aunque sigan en el carrito.
            if (!producto.isActivo()) {
                throw new BadRequestException(
                        "El producto '" + producto.getNombre() + "' ya no está disponible");
            }

            // Rechaza si no hay stock suficiente.
            if (producto.getStock() < detalle.getCantidad()) {
                throw new BadRequestException(
                        "Stock insuficiente para '" + producto.getNombre() + "'. Disponible: "
                                + producto.getStock() + ", solicitado: " + detalle.getCantidad());
            }

            // Descuenta el stock.
            producto.setStock(producto.getStock() - detalle.getCantidad());

            // Asigna la instancia gestionada: evita NonUniqueObjectException al persistir.
            detalle.setProducto(producto);
            detalle.setPrecioUnitario(producto.getPrecio());
            detalle.setSubtotal(producto.getPrecio() * detalle.getCantidad());
            detalle.setVenta(venta);

            total += detalle.getSubtotal();
        }

        venta.setTotal(total);
        return ventasRepository.save(venta);
    }
}
