package com.example.mercaditolibre.exception;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;

// Convierte las excepciones de la API en respuestas JSON uniformes (ApiError).
@RestControllerAdvice
public class GlobalExceptionHandler {

    // Recurso inexistente -> 404
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex, HttpServletRequest req) {
        return build(HttpStatus.NOT_FOUND, ex.getMessage(), req, null);
    }

    // Regla de negocio o argumento inválido -> 400
    @ExceptionHandler({BadRequestException.class, IllegalArgumentException.class})
    public ResponseEntity<ApiError> handleBadRequest(RuntimeException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, ex.getMessage(), req, null);
    }

    // Credenciales inválidas en el login -> 401
    @ExceptionHandler(org.springframework.security.core.AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuth(org.springframework.security.core.AuthenticationException ex,
                                               HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Usuario o contraseña incorrectos", req, null);
    }

    // Autenticado pero sin permiso sobre el recurso -> 403
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDenied(org.springframework.security.access.AccessDeniedException ex,
                                                       HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, ex.getMessage(), req, null);
    }

    // Falla la llamada a Stripe -> 502. getStripeError es null si no hubo respuesta (sin internet).
    @ExceptionHandler(com.stripe.exception.StripeException.class)
    public ResponseEntity<ApiError> handleStripe(com.stripe.exception.StripeException ex, HttpServletRequest req) {
        String detalle = ex.getStripeError() != null ? ex.getStripeError().getMessage() : ex.getMessage();
        return build(HttpStatus.BAD_GATEWAY, "No se pudo procesar el pago con Stripe: " + detalle, req, null);
    }

    // @Valid falla -> 400 con detalle por campo
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest req) {
        Map<String, String> errores = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errores.put(fe.getField(), fe.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "Hay campos con errores de validación", req, errores);
    }

    // Cuerpo JSON mal formado o con tipos incompatibles -> 400
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex, HttpServletRequest req) {
        return build(HttpStatus.BAD_REQUEST, "El cuerpo de la petición no es válido o está mal formado", req, null);
    }

    // Restricción de BD violada, p. ej. duplicado -> 409
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrity(DataIntegrityViolationException ex, HttpServletRequest req) {
        return build(HttpStatus.CONFLICT,
                "No se pudo completar la operación: viola una restricción de datos (¿valor duplicado?)", req, null);
    }

    // Cualquier otra excepción -> 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGeneric(Exception ex, HttpServletRequest req) {
        return build(HttpStatus.INTERNAL_SERVER_ERROR,
                "Error interno del servidor: " + ex.getMessage(), req, null);
    }

    private ResponseEntity<ApiError> build(HttpStatus status, String message, HttpServletRequest req,
                                           Map<String, String> errores) {
        ApiError body = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(req.getRequestURI())
                .errores(errores)
                .build();
        return ResponseEntity.status(status).body(body);
    }
}
