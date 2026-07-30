package com.example.mercaditolibre.service;

import java.util.List;
import java.util.Objects;

import org.springframework.beans.BeanUtils;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.ProductoEntity;
import com.example.mercaditolibre.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductoService {
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public List<ProductoEntity> getAllProductos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ProductoEntity> getAllProductosActivos() {
        return productoRepository.findAll().stream().filter(ProductoEntity::isActivo).toList();
    }

    @Transactional(readOnly = true)
    public ProductoEntity getProductoById(long id) {
        return productoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
    }

    // Los campos ya los valida @Valid en el controlador.
    @Transactional
    public ProductoEntity createProducto(ProductoEntity producto) {
        if (producto.getDescripcion() == null) {
            producto.setDescripcion("");
        }
        return productoRepository.save(producto);
    }

    @Transactional
    public ProductoEntity updateProducto(@NonNull Long id, @NonNull ProductoEntity producto) {
        ProductoEntity productoExistente = productoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        if (producto.getDescripcion() == null) {
            producto.setDescripcion("");
        }
        // imagenUrl se ignora a propósito: lo gestionan los endpoints de imagen.
        // Si no, editar un producto sin reenviar ese campo le borraría la imagen.
        BeanUtils.copyProperties(producto, productoExistente, "id", "imagenUrl");
        return productoRepository.save(Objects.requireNonNull(productoExistente));
    }

    // Eliminación lógica: se marca activo=false, no se borra el registro.
    @Transactional
    public void deleteProducto(long id) {
        ProductoEntity existingProducto = productoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        existingProducto.setActivo(false);
        productoRepository.save(existingProducto);
    }

    // Reactiva un producto dado de baja: activo=true.
    @Transactional
    public ProductoEntity reactivarProducto(long id) {
        ProductoEntity existingProducto = productoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        existingProducto.setActivo(true);
        return productoRepository.save(existingProducto);
    }

}
