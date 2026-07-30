package com.example.mercaditolibre.models;

import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "pagos")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class PagoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Venta del pago. Ignora "detalles" para no arrastrar la venta entera al serializar.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "venta_id")
    @JsonIgnoreProperties("detalles")
    private VentasEntity venta;

    @Positive(message = "El monto del pago debe ser mayor a cero")
    @Column(name = "monto", nullable = false)
    private double monto;

    // Efectivo, tarjeta, transferencia, etc.
    @NotBlank(message = "El método de pago es obligatorio")
    @Column(name = "metodo", nullable = false, length = 50)
    private String metodo;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    // Folio o referencia, opcional.
    @Column(name = "referencia", nullable = true, length = 100)
    private String referencia;
}
