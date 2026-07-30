package com.example.mercaditolibre.models;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ventas")
@Getter @Setter @AllArgsConstructor @NoArgsConstructor @Builder
public class VentasEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "total")
    private double total;

    @Column(name = "estado_pago")
    private String estadoPago;

    // Username del UsuarioEntity que hizo la compra. Filtra "Mis Compras".
    @Column(name = "username")
    private String username;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id")
    private ClienteEntity cliente;

    @OneToMany(mappedBy = "venta", cascade = CascadeType.ALL)
    @Builder.Default
    @JsonIgnoreProperties("venta")
    private List<DetalleVentaEntity> detalles = new ArrayList<>();
}
