package com.example.mercaditolibre.repository;

import com.example.mercaditolibre.models.ProductoImagenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductoImagenRepository extends JpaRepository<ProductoImagenEntity, Long> {
}
