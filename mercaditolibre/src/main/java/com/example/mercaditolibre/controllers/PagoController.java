package com.example.mercaditolibre.controllers;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mercaditolibre.dto.ConfirmarPagoRequest;
import com.example.mercaditolibre.dto.PagoConfigResponse;
import com.example.mercaditolibre.dto.PagoRequest;
import com.example.mercaditolibre.models.VentasEntity;
import com.example.mercaditolibre.service.StripePagoService;
import com.stripe.exception.StripeException;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/pagos")
@RequiredArgsConstructor
public class PagoController {

    private final StripePagoService stripePagoService;

    // Clave pública y flags que el front necesita para pintar el checkout.
    @GetMapping("/config")
    public ResponseEntity<PagoConfigResponse> config() {
        return ResponseEntity.ok(stripePagoService.obtenerConfig());
    }

    @PostMapping("/crear-intencion")
    public ResponseEntity<Map<String, String>> crearIntencion(@RequestBody PagoRequest peticion,
                                                              Authentication auth) throws StripeException {
        String clientSecret = stripePagoService.crearIntencion(peticion.getIdVenta(), peticion.getMoneda(), auth);
        return ResponseEntity.ok(Map.of("clientSecret", clientSecret));
    }

    // Verifica el cobro contra Stripe antes de marcar la venta como pagada.
    @PostMapping("/confirmar-pago/{idVenta}")
    public ResponseEntity<VentasEntity> confirmarPago(@PathVariable Long idVenta,
                                                      @RequestBody ConfirmarPagoRequest peticion,
                                                      Authentication auth) throws StripeException {
        return ResponseEntity.ok(
                stripePagoService.confirmarPago(idVenta, peticion.getPaymentIntentId(), auth));
    }

    // Solo responde si app.pagos.simulador=true; si no, 403.
    @PostMapping("/simular-pago/{idVenta}")
    public ResponseEntity<VentasEntity> simularPago(@PathVariable Long idVenta, Authentication auth) {
        return ResponseEntity.ok(stripePagoService.simularPago(idVenta, auth));
    }
}
