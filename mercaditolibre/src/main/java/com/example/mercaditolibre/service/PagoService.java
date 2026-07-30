package com.example.mercaditolibre.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.PagoEntity;
import com.example.mercaditolibre.repository.PagoRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PagoService {
    private final PagoRepository pagoRepository;

    public List<PagoEntity> getAllPagos() {
        return pagoRepository.findAll();
    }

    public PagoEntity getPagoById(long id) {
        return pagoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado: " + id));
    }

    public PagoEntity createPago(PagoEntity pago) {
        validarVenta(pago);
        if (pago.getFecha() == null) {
            pago.setFecha(LocalDate.now());
        }
        return pagoRepository.save(pago);
    }

    public PagoEntity updatePago(long id, PagoEntity pago) {
        PagoEntity existente = pagoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado: " + id));
        validarVenta(pago);
        existente.setVenta(pago.getVenta());
        existente.setMonto(pago.getMonto());
        existente.setMetodo(pago.getMetodo());
        existente.setReferencia(pago.getReferencia());
        if (pago.getFecha() != null) {
            existente.setFecha(pago.getFecha());
        }
        return pagoRepository.save(existente);
    }

    public void deletePago(long id) {
        PagoEntity existente = pagoRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado: " + id));
        pagoRepository.delete(existente);
    }

    // Exige que el pago referencie una venta con id.
    private void validarVenta(PagoEntity pago) {
        if (pago.getVenta() == null || pago.getVenta().getId() == null) {
            throw new BadRequestException("El pago debe estar asociado a una venta");
        }
    }
}
