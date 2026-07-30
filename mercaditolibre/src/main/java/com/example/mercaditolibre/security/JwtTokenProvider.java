package com.example.mercaditolibre.security;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import lombok.extern.slf4j.Slf4j;

// Genera y valida tokens JWT con firma HS256.
@Component
@Slf4j
public class JwtTokenProvider {

    // HS256 exige 256 bits de clave.
    private static final int MIN_BYTES_SECRETO = 32;

    private final SecretKey key;
    private final long jwtExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret:}") String secret,
            @Value("${jwt.expiration:86400000}") long jwtExpirationMs) {
        this.jwtExpirationMs = jwtExpirationMs;
        this.key = construirClave(secret);
    }

    // Sin JWT_SECRET se genera una clave al azar en cada arranque: la app sigue usable en local,
    // pero las sesiones mueren al reiniciar. Nunca se firma con un secreto por defecto conocido.
    private static SecretKey construirClave(String secret) {
        if (secret == null || secret.isBlank()) {
            log.warn("JWT_SECRET vacia: se firma con una clave aleatoria de este arranque. "
                    + "Las sesiones se invalidaran al reiniciar y NO sirve en produccion "
                    + "(con varias instancias cada una rechazaria los tokens de las otras). "
                    + "Define JWT_SECRET con 32+ caracteres.");
            return Jwts.SIG.HS256.key().build();
        }

        byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < MIN_BYTES_SECRETO) {
            throw new IllegalStateException("JWT_SECRET demasiado corta: " + bytes.length
                    + " bytes. HS256 exige al menos " + MIN_BYTES_SECRETO + " caracteres.");
        }
        return Keys.hmacShaKeyFor(bytes);
    }

    public String generateToken(Authentication authentication) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .subject(authentication.getName())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public String getUsernameFromJWT(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
}
