package com.example.mercaditolibre.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

// Lo que el front manda tras confirmar la tarjeta en Stripe.
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ConfirmarPagoRequest {

    // Id del PaymentIntent (pi_...). El backend lo verifica contra Stripe.
    private String paymentIntentId;
}
