package com.example.mercaditolibre.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.mercaditolibre.models.Rol;
import com.example.mercaditolibre.models.UsuarioEntity;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Long> {

    Optional<UsuarioEntity> findByUsername(String username);

    boolean existsByUsername(String username);

    boolean existsByRole(Rol role);
}
