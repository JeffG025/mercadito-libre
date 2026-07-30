package com.example.mercaditolibre.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.mercaditolibre.dto.ActualizarPerfilRequest;
import com.example.mercaditolibre.dto.CambiarPasswordRequest;
import com.example.mercaditolibre.dto.CrearUsuarioRequest;
import com.example.mercaditolibre.dto.PerfilResponse;
import com.example.mercaditolibre.dto.RegistroRequest;
import com.example.mercaditolibre.exception.BadRequestException;
import com.example.mercaditolibre.exception.ResourceNotFoundException;
import com.example.mercaditolibre.models.Rol;
import com.example.mercaditolibre.models.UsuarioEntity;
import com.example.mercaditolibre.repository.UsuarioRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public UsuarioEntity registrar(RegistroRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("El nombre de usuario ya está en uso.");
        }

        // Fuerza ROLE_CLIENTE e ignora request.getRol(): impide autoasignarse admin.
        UsuarioEntity usuario = UsuarioEntity.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .email(request.getEmail())
                .direccion(request.getDireccion())
                .role(Rol.ROLE_CLIENTE)
                .build();

        return usuarioRepository.save(usuario);
    }

    // Alta desde el panel: aquí sí se respeta el rol pedido, para poder tener más de un admin.
    @Transactional
    public PerfilResponse crearDesdePanel(CrearUsuarioRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("El nombre de usuario ya está en uso.");
        }

        UsuarioEntity usuario = UsuarioEntity.builder()
                .username(request.getUsername().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .nombre(request.getNombre())
                .email(request.getEmail())
                .direccion(request.getDireccion())
                .role(aRol(request.getRol()))
                .build();

        return aPerfil(usuarioRepository.save(usuario));
    }

    @Transactional
    public List<PerfilResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioService::aPerfil).toList();
    }

    @Transactional
    public PerfilResponse obtenerPerfil(String username) {
        return aPerfil(buscar(username));
    }

    @Transactional
    public PerfilResponse actualizarPerfil(String username, ActualizarPerfilRequest request) {
        UsuarioEntity usuario = buscar(username);
        usuario.setNombre(request.getNombre().trim());
        // Cadena vacía se guarda como null: deja el campo "sin dato" en vez de con un texto vacío.
        usuario.setEmail(normalizar(request.getEmail()));
        usuario.setDireccion(normalizar(request.getDireccion()));
        return aPerfil(usuarioRepository.save(usuario));
    }

    @Transactional
    public void cambiarPassword(String username, CambiarPasswordRequest request) {
        UsuarioEntity usuario = buscar(username);

        if (!passwordEncoder.matches(request.getPasswordActual(), usuario.getPassword())) {
            throw new BadRequestException("La contraseña actual no es correcta.");
        }
        if (passwordEncoder.matches(request.getPasswordNueva(), usuario.getPassword())) {
            throw new BadRequestException("La contraseña nueva debe ser distinta de la actual.");
        }

        usuario.setPassword(passwordEncoder.encode(request.getPasswordNueva()));
        usuarioRepository.save(usuario);
    }

    private UsuarioEntity buscar(String username) {
        return usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + username));
    }

    // Acepta "ROLE_ADMIN" o "ADMIN". Cualquier otra cosa cae en cliente.
    private static Rol aRol(String rol) {
        if (rol == null || rol.isBlank()) {
            return Rol.ROLE_CLIENTE;
        }
        String limpio = rol.trim().toUpperCase();
        if (!limpio.startsWith("ROLE_")) {
            limpio = "ROLE_" + limpio;
        }
        try {
            return Rol.valueOf(limpio);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Rol no válido: " + rol + ". Usa ROLE_ADMIN o ROLE_CLIENTE.");
        }
    }

    private static String normalizar(String valor) {
        if (valor == null || valor.isBlank()) {
            return null;
        }
        return valor.trim();
    }

    private static PerfilResponse aPerfil(UsuarioEntity u) {
        return new PerfilResponse(u.getId(), u.getUsername(), u.getNombre(),
                u.getEmail(), u.getDireccion(), u.getRole().name());
    }
}
