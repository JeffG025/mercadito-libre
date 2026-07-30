package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

// Config que el front necesita para pintar el checkout. Nunca incluye la clave secreta.
@Getter @AllArgsConstructor
public class PagoConfigResponse {

    private String publicKey;
    private boolean stripeHabilitado;
    private boolean simuladorHabilitado;
}
