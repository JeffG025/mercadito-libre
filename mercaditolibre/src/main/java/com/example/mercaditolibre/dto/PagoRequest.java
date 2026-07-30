package com.example.mercaditolibre.dto;

public class PagoRequest {

    private Long idVenta;
    private String moneda;

    public PagoRequest(Long idVenta, String moneda) {
        this.idVenta = idVenta;
        this.moneda = moneda;
    }

    public Long getIdVenta() {
        return idVenta;
    }

    public void setIdVenta(Long idVenta) {
        this.idVenta = idVenta;
    }

    public String getMoneda() {
        return moneda;
    }

    public void setMoneda(String moneda) {
        this.moneda = moneda;
    }
}
