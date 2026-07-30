package com.example.mercaditolibre.exception;

// Recurso inexistente. GlobalExceptionHandler la traduce a 404.
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String mensaje) {
        super(mensaje);
    }
}
