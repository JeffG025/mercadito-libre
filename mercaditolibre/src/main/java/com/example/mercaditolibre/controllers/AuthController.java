package com.example.mercaditolibre.controllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.mercaditolibre.dto.AuthRequest;
import com.example.mercaditolibre.dto.AuthResponse;
import com.example.mercaditolibre.dto.PerfilResponse;
import com.example.mercaditolibre.dto.RegistroRequest;
import com.example.mercaditolibre.models.UsuarioEntity;
import com.example.mercaditolibre.security.JwtTokenProvider;
import com.example.mercaditolibre.service.UsuarioService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UsuarioService usuarioService;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        String token = jwtTokenProvider.generateToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("ROLE_CLIENTE");

        // El nombre real sale del perfil; UserDetails solo transporta el username.
        PerfilResponse perfil = usuarioService.obtenerPerfil(userDetails.getUsername());
        String nombre = perfil.getNombre() != null && !perfil.getNombre().isBlank()
                ? perfil.getNombre()
                : userDetails.getUsername();

        AuthResponse body = new AuthResponse(token, userDetails.getUsername(), nombre, role);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/registro")
    public ResponseEntity<UsuarioEntity> registro(@RequestBody RegistroRequest request) {
        UsuarioEntity usuario = usuarioService.registrar(request);
        return new ResponseEntity<>(usuario, HttpStatus.CREATED);
    }
}
