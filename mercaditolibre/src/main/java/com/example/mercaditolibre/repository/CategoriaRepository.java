package com.example.mercaditolibre.repository;

import org.springframework.stereotype.Repository;
import com.example.mercaditolibre.models.CategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface CategoriaRepository extends JpaRepository<CategoriaEntity, Long> {


}
