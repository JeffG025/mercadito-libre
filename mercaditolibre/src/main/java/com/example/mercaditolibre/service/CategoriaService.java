package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.CategoriaEntity;
import com.example.mercaditolibre.repository.CategoriaRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoriaService {
    private final CategoriaRepository categoriaRepository;

    public List<CategoriaEntity> getAllCategorias() {
        return categoriaRepository.findAll();
    }

    public List<CategoriaEntity> getAllCategoriasActivas() {
        return categoriaRepository.findAll().stream().filter(CategoriaEntity::isActivo).toList();
    }

    public CategoriaEntity getCategoriaById(long id) {
        return categoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
    }

    public CategoriaEntity createCategoria(CategoriaEntity categoria) {
        return categoriaRepository.save(categoria);
    }

    public CategoriaEntity updateCategoria(long id, CategoriaEntity categoria) {
        CategoriaEntity existing = categoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        existing.setNombre(categoria.getNombre());
        existing.setDescripcion(categoria.getDescripcion());
        existing.setActivo(categoria.isActivo());
        return categoriaRepository.save(existing);
    }

    public void deleteCategoria(long id) {
        CategoriaEntity existing = categoriaRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        existing.setActivo(false);
        categoriaRepository.save(existing);
    }
}
