package com.example.mercaditolibre.repository;

import java.util.Optional;

import com.example.mercaditolibre.models.PagoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PagoRepository extends JpaRepository<PagoEntity, Long> {

    // La referencia guarda el id del PaymentIntent: distingue el reintento legítimo del pago reutilizado.
    Optional<PagoEntity> findByReferencia(String referencia);
}
