package com.example.mercaditolibre.exception;

import java.time.LocalDateTime;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;

// Cuerpo uniforme de los errores de la API. Los campos nulos se omiten del JSON.
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiError {
    private LocalDateTime timestamp;
    private int status;
    private String error;
    private String message;
    private String path;
    // Errores por campo cuando falla @Valid.
    private Map<String, String> errores;
}
