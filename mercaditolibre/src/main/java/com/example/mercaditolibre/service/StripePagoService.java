package com.example.mercaditolibre.service;

import java.time.LocalDate;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;

import com.example.mercaditolibre.dto.PagoConfigResponse;
import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.models.PagoEntity;
import com.example.mercaditolibre.models.VentasEntity;
import com.example.mercaditolibre.repository.PagoRepository;
import com.example.mercaditolibre.repository.VentasRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

// Cobro con Stripe: crea la intención de pago y confirma contra la API de Stripe antes de tocar la BD.
@Service
@Slf4j
@RequiredArgsConstructor
public class StripePagoService {

    private static final String ESTADO_PAGADO = "Pagado";
    private static final String METODO_STRIPE = "Stripe";
    private static final String METODO_SIMULADO = "Simulado";

    private final VentasService ventasService;
    private final VentasRepository ventasRepository;
    private final PagoRepository pagoRepository;

    @Value("${stripe.apikey.secret:}")
    private String claveSecreta;

    @Value("${stripe.apikey.public:}")
    private String clavePublica;

    // Permite marcar ventas como pagadas sin cobrar. Debe quedar en false en el host.
    @Value("${app.pagos.simulador:false}")
    private boolean simuladorHabilitado;

    // Fija la clave una sola vez al arrancar, no en cada petición.
    @PostConstruct
    void configurarStripe() {
        if (stripeHabilitado()) {
            Stripe.apiKey = claveSecreta;
            log.info("Stripe configurado en modo {}", claveSecreta.startsWith("sk_live_") ? "LIVE (dinero real)" : "prueba");
        } else {
            // Aviso visible al arrancar: si no, el fallo solo se descubre al llegar al checkout.
            log.warn("STRIPE_SECRET_KEY vacia: el pago con tarjeta queda deshabilitado. "
                    + "Spring Boot no lee el .env por si solo; cargalo con el envFile de launch.json "
                    + "o exporta las variables antes de arrancar.");
        }
    }

    public PagoConfigResponse obtenerConfig() {
        return new PagoConfigResponse(clavePublica, stripeHabilitado(), simuladorHabilitado);
    }

    // Crea el PaymentIntent y devuelve su clientSecret para que el front cobre la tarjeta.
    public String crearIntencion(Long idVenta, String moneda, Authentication auth) throws StripeException {
        if (!stripeHabilitado()) {
            throw new BadRequestException("Stripe no está configurado en el servidor");
        }

        VentasEntity venta = ventasService.getVentaById(idVenta);
        exigirPropiedad(venta, auth);

        if (ESTADO_PAGADO.equalsIgnoreCase(venta.getEstadoPago())) {
            throw new BadRequestException("La venta " + idVenta + " ya está pagada");
        }

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(aCentavos(venta.getTotal()))
                .setCurrency(moneda != null && !moneda.isBlank() ? moneda : "mxn")
                // Solo tarjeta: es lo que sabe manejar el CardElement del front.
                .addPaymentMethodType("card")
                .putMetadata("id_venta", venta.getId().toString())
                .build();

        return PaymentIntent.create(params).getClientSecret();
    }

    // Marca la venta como pagada solo si Stripe confirma que ese PaymentIntent se cobró.
    @Transactional
    public VentasEntity confirmarPago(Long idVenta, String paymentIntentId, Authentication auth)
            throws StripeException {

        if (paymentIntentId == null || paymentIntentId.isBlank()) {
            throw new BadRequestException("Falta el paymentIntentId");
        }

        VentasEntity venta = ventasService.getVentaById(idVenta);
        exigirPropiedad(venta, auth);

        // Ese PaymentIntent ya se registró antes.
        Optional<PagoEntity> pagoPrevio = pagoRepository.findByReferencia(paymentIntentId);
        if (pagoPrevio.isPresent()) {
            // Misma venta: es un reintento legítimo, no se duplica el registro.
            if (idVenta.equals(pagoPrevio.get().getVenta().getId())) {
                return venta;
            }
            // Otra venta: intento de saldar dos compras con un solo cobro.
            throw new BadRequestException("Ese pago ya se aplicó a otra venta");
        }
        if (!stripeHabilitado()) {
            throw new BadRequestException("Stripe no está configurado en el servidor");
        }

        PaymentIntent intent = PaymentIntent.retrieve(paymentIntentId);

        // El intent tiene que ser de ESTA venta: sin esto valdría reusar el pago de una compra barata.
        String idVentaEnStripe = intent.getMetadata() != null ? intent.getMetadata().get("id_venta") : null;
        if (!idVenta.toString().equals(idVentaEnStripe)) {
            throw new BadRequestException("El pago no corresponde a la venta " + idVenta);
        }
        if (!"succeeded".equals(intent.getStatus())) {
            throw new BadRequestException("El pago no está completado en Stripe (estado: " + intent.getStatus() + ")");
        }

        long esperado = aCentavos(venta.getTotal());
        long recibido = intent.getAmountReceived() != null ? intent.getAmountReceived() : 0L;
        if (recibido < esperado) {
            throw new BadRequestException("El monto cobrado no cubre el total de la venta");
        }

        return marcarPagada(venta, venta.getTotal(), METODO_STRIPE, paymentIntentId);
    }

    // Respaldo para demos sin claves ni internet. Apagado salvo que app.pagos.simulador=true.
    @Transactional
    public VentasEntity simularPago(Long idVenta, Authentication auth) {
        if (!simuladorHabilitado) {
            throw new AccessDeniedException("El simulador de pagos está deshabilitado");
        }

        VentasEntity venta = ventasService.getVentaById(idVenta);
        exigirPropiedad(venta, auth);

        if (ESTADO_PAGADO.equalsIgnoreCase(venta.getEstadoPago())) {
            return venta;
        }
        return marcarPagada(venta, venta.getTotal(), METODO_SIMULADO, "sim_" + idVenta);
    }

    private VentasEntity marcarPagada(VentasEntity venta, double monto, String metodo, String referencia) {
        venta.setEstadoPago(ESTADO_PAGADO);
        VentasEntity guardada = ventasRepository.save(venta);

        pagoRepository.save(PagoEntity.builder()
                .venta(guardada)
                .monto(monto)
                .metodo(metodo)
                .fecha(LocalDate.now())
                .referencia(referencia)
                .build());

        return guardada;
    }

    // Solo el dueño de la venta o un admin pueden pagarla o consultarla.
    private void exigirPropiedad(VentasEntity venta, Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("No autenticado");
        }
        boolean esAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (esAdmin) {
            return;
        }
        if (venta.getUsername() == null || !venta.getUsername().equals(auth.getName())) {
            throw new AccessDeniedException("Esta venta no te pertenece");
        }
    }

    private boolean stripeHabilitado() {
        return claveSecreta != null && !claveSecreta.isBlank();
    }

    // Stripe cobra en la unidad mínima. Math.round evita perder un centavo por el double.
    private long aCentavos(double total) {
        return Math.round(total * 100);
    }
}
