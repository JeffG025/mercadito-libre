package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.ProveedorEntity;
import com.example.mercaditolibre.repository.ProveedorRepository;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class ProovedorService {
    private final ProveedorRepository proveedorRepository;

    @Transactional(readOnly = true)
    public List<ProveedorEntity> getAllProveedores() {
        return proveedorRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<ProveedorEntity> getAllProveedoresActivos() {
        return proveedorRepository.findAll().stream().filter(ProveedorEntity::isActivo).toList();
    }

    @Transactional(readOnly = true)
    public ProveedorEntity getProveedorById(long id) {
        return proveedorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
    }

    @Transactional
    public ProveedorEntity createProveedor(ProveedorEntity proveedor) {
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public ProveedorEntity updateProveedor(long id, ProveedorEntity proveedor) {
        ProveedorEntity existingProveedor = proveedorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
        existingProveedor.setNombre(proveedor.getNombre());
        existingProveedor.setEmail(proveedor.getEmail());
        existingProveedor.setTelefono(proveedor.getTelefono());
        existingProveedor.setDireccion(proveedor.getDireccion());
        existingProveedor.setActivo(proveedor.isActivo());
        return proveedorRepository.save(existingProveedor);
    }

    @Transactional
    public void deleteProveedor(long id) {
        ProveedorEntity existingProveedor = proveedorRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
        existingProveedor.setActivo(false);
        proveedorRepository.save(existingProveedor);
    }

}
