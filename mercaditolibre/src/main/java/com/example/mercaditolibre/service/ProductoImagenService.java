package com.example.mercaditolibre.service;

import java.io.IOException;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.ProductoEntity;
import com.example.mercaditolibre.models.ProductoImagenEntity;
import com.example.mercaditolibre.repository.ProductoImagenRepository;
import com.example.mercaditolibre.repository.ProductoRepository;

import lombok.RequiredArgsConstructor;

// Guarda y sirve la imagen de cada producto desde la BD.
@Service
@RequiredArgsConstructor
public class ProductoImagenService {

    private static final Set<String> TIPOS_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");
    private static final long MAX_BYTES = 2L * 1024 * 1024;

    private final ProductoImagenRepository imagenRepository;
    private final ProductoRepository productoRepository;

    @Transactional
    public ProductoEntity guardar(Long productoId, MultipartFile archivo) {
        ProductoEntity producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));

        if (archivo == null || archivo.isEmpty()) {
            throw new BadRequestException("No se recibió ningún archivo");
        }
        String tipo = archivo.getContentType();
        if (tipo == null || !TIPOS_PERMITIDOS.contains(tipo.toLowerCase())) {
            throw new BadRequestException("Formato no admitido. Usa JPG, PNG, WEBP o GIF");
        }
        if (archivo.getSize() > MAX_BYTES) {
            throw new BadRequestException("La imagen no puede pesar más de 2 MB");
        }

        byte[] datos;
        try {
            datos = archivo.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo leer el archivo: " + ex.getMessage());
        }

        long version = System.currentTimeMillis();
        imagenRepository.save(ProductoImagenEntity.builder()
                .productoId(productoId)
                .datos(datos)
                .tipo(tipo.toLowerCase())
                .version(version)
                .build());

        // La URL lleva la versión para que al reemplazar la imagen el navegador no muestre la vieja.
        producto.setImagenUrl(urlDe(productoId, version));
        return productoRepository.save(producto);
    }

    @Transactional(readOnly = true)
    public ProductoImagenEntity obtener(Long productoId) {
        return imagenRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("El producto " + productoId + " no tiene imagen"));
    }

    @Transactional
    public ProductoEntity eliminar(Long productoId) {
        ProductoEntity producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));
        imagenRepository.deleteById(productoId);
        producto.setImagenUrl(null);
        return productoRepository.save(producto);
    }

    private String urlDe(Long productoId, long version) {
        return "/api/v1/productos/" + productoId + "/imagen?v=" + version;
    }
}
