package com.example.mercaditolibre.repository;

import com.example.mercaditolibre.models.ProveedorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProveedorRepository extends JpaRepository<ProveedorEntity, Long> {

}
