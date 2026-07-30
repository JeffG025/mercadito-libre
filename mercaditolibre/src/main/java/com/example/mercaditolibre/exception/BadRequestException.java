package com.example.mercaditolibre.exception;

// Regla de negocio incumplida. GlobalExceptionHandler la traduce a 400.
public class BadRequestException extends RuntimeException {
    public BadRequestException(String mensaje) {
        super(mensaje);
    }
}
