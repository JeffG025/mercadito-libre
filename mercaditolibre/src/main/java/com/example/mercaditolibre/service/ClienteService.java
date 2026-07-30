package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.ClienteEntity;
import com.example.mercaditolibre.repository.ClienteRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ClienteService {
    private final ClienteRepository clienteRepository;

    public List<ClienteEntity> getAllClientes() {
        return clienteRepository.findAll();
    }

    public List<ClienteEntity> getAllClientesActivos() {
        return clienteRepository.findAll().stream().filter(ClienteEntity::isActivo).toList();
    }

    public ClienteEntity getClienteById(long id) {
        return clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
    }

    public ClienteEntity createCliente(ClienteEntity cliente) {
        return clienteRepository.save(cliente);
    }

    public ClienteEntity updateCliente(long id, ClienteEntity cliente) {
        ClienteEntity existingCliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
        existingCliente.setNombre(cliente.getNombre());
        existingCliente.setApellido(cliente.getApellido());
        existingCliente.setEmail(cliente.getEmail());
        existingCliente.setTelefono(cliente.getTelefono());
        existingCliente.setActivo(cliente.isActivo());
        return clienteRepository.save(existingCliente);
    }

    public void deleteCliente(long id) {
        ClienteEntity existingCliente = clienteRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
        existingCliente.setActivo(false);
        clienteRepository.save(existingCliente);
    }

}
