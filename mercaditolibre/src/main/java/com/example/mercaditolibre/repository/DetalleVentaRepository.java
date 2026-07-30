package com.example.mercaditolibre.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.mercaditolibre.models.DetalleVentaEntity;

@Repository
public interface DetalleVentaRepository extends JpaRepository<DetalleVentaEntity, Long> {

}
