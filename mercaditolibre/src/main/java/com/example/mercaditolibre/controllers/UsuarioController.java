package com.example.mercaditolibre.controllers;

import java.security.Principal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mercaditolibre.dto.ActualizarPerfilRequest;
import com.example.mercaditolibre.dto.CambiarPasswordRequest;
import com.example.mercaditolibre.dto.CrearUsuarioRequest;
import com.example.mercaditolibre.dto.PerfilResponse;
import com.example.mercaditolibre.service.UsuarioService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService servicio;

    // --- Perfil propio. Cualquier usuario autenticado, siempre sobre SU cuenta:
    // el username sale del token (principal), nunca de la petición.

    @GetMapping("/perfil")
    public ResponseEntity<PerfilResponse> miPerfil(Principal principal) {
        return ResponseEntity.ok(servicio.obtenerPerfil(principal.getName()));
    }

    @PutMapping("/perfil")
    public ResponseEntity<PerfilResponse> actualizarMiPerfil(@Valid @RequestBody ActualizarPerfilRequest peticion,
                                                             Principal principal) {
        return ResponseEntity.ok(servicio.actualizarPerfil(principal.getName(), peticion));
    }

    @PutMapping("/perfil/password")
    public ResponseEntity<Map<String, String>> cambiarMiPassword(@Valid @RequestBody CambiarPasswordRequest peticion,
                                                                 Principal principal) {
        servicio.cambiarPassword(principal.getName(), peticion);
        return ResponseEntity.ok(Map.of("message", "Contraseña actualizada"));
    }

    // --- Gestión de usuarios. Solo ADMIN por las reglas de SecurityConfig.

    @GetMapping
    public ResponseEntity<List<PerfilResponse>> listar() {
        return ResponseEntity.ok(servicio.listar());
    }

    @PostMapping
    public ResponseEntity<PerfilResponse> crear(@Valid @RequestBody CrearUsuarioRequest peticion) {
        return new ResponseEntity<>(servicio.crearDesdePanel(peticion), HttpStatus.CREATED);
    }
}
