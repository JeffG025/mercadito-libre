package com.example.mercaditolibre.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.example.mercaditolibre.models.Rol;
import com.example.mercaditolibre.models.UsuarioEntity;
import com.example.mercaditolibre.repository.UsuarioRepository;

// Crea el admin por defecto (admin / admin123) al arrancar si no existe ningún ADMIN.
@Component
public class AdminSeeder implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByRole(Rol.ROLE_ADMIN)) {
            UsuarioEntity admin = UsuarioEntity.builder()
                    .username("admin")
                    .password(passwordEncoder.encode("admin123"))
                    .nombre("Administrador")
                    .role(Rol.ROLE_ADMIN)
                    .build();
            usuarioRepository.save(admin);
        }
    }
}
