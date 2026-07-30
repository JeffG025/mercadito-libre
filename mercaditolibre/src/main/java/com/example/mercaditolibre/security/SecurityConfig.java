package com.example.mercaditolibre.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.mercaditolibre.service.CustomUserDetailsService;

import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;

@Configuration
@Slf4j
public class SecurityConfig {

    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    // Origenes que pueden llamar a la API, separados por comas. Se define por entorno (CORS_ORIGINS).
    @Value("${app.cors.allowed-origins}")
    private String corsOrigins;

    public SecurityConfig(JwtTokenProvider tokenProvider, CustomUserDetailsService customUserDetailsService) {
        this.tokenProvider = tokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(tokenProvider, customUserDetailsService);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Sin token -> 401. Token válido sin permisos -> 403.
            // setStatus y nunca sendError: sendError redirige a /error y convierte los 403 en 401.
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authEx) ->
                    escribirError(response, HttpServletResponse.SC_UNAUTHORIZED, "No autenticado"))
                .accessDeniedHandler((request, response, deniedEx) ->
                    escribirError(response, HttpServletResponse.SC_FORBIDDEN,
                            "No tienes permisos para este recurso")))
            .authorizeHttpRequests(auth -> auth
                // Preflight CORS.
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // Público: login y registro.
                .requestMatchers("/api/v1/auth/**").permitAll()

                // Público: leer catálogo.
                .requestMatchers(HttpMethod.GET, "/api/v1/productos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/v1/categorias/**").permitAll()

                // Solo ADMIN: escribir catálogo.
                .requestMatchers(HttpMethod.POST, "/api/v1/productos/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/productos/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/productos/**").hasAuthority("ROLE_ADMIN")

                .requestMatchers(HttpMethod.POST, "/api/v1/categorias/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/categorias/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/categorias/**").hasAuthority("ROLE_ADMIN")

                // Ventas: POST cliente o admin; leer y editar solo admin.
                .requestMatchers(HttpMethod.POST, "/api/v1/ventas/**").hasAnyAuthority("ROLE_CLIENTE", "ROLE_ADMIN")
                // Mis Compras: cada uno ve las suyas. Antes de la regla admin de abajo.
                .requestMatchers(HttpMethod.GET, "/api/v1/ventas/mias").hasAnyAuthority("ROLE_CLIENTE", "ROLE_ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/v1/ventas/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/v1/ventas/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/v1/ventas/**").hasAuthority("ROLE_ADMIN")

                // Pagos: cliente o admin.
                .requestMatchers("/api/v1/pagos/**").hasAnyAuthority("ROLE_CLIENTE", "ROLE_ADMIN")

                // Perfil propio: cualquiera con sesión. ANTES de la regla de usuarios de abajo,
                // que si no se la comería y solo los admin podrían ver su perfil.
                .requestMatchers("/api/v1/usuarios/perfil/**").hasAnyAuthority("ROLE_CLIENTE", "ROLE_ADMIN")
                .requestMatchers("/api/v1/usuarios/perfil").hasAnyAuthority("ROLE_CLIENTE", "ROLE_ADMIN")

                // Alta y listado de usuarios (incluido crear otros admin): solo ADMIN.
                .requestMatchers("/api/v1/usuarios/**").hasAuthority("ROLE_ADMIN")

                // Solo ADMIN.
                .requestMatchers("/api/v1/estadisticas/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/v1/proveedores/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/v1/clientes/**").hasAuthority("ROLE_ADMIN")
                .requestMatchers("/api/v1/detalles/**").hasAuthority("ROLE_ADMIN")

                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // Escribe el error como {"message": ...}.
    private static void escribirError(HttpServletResponse response, int status, String mensaje)
            throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());
        response.getWriter().write("{\"message\":\"" + mensaje + "\"}");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Único punto de CORS. Los origenes vienen de configuración (CORS_ORIGINS), no del código.
        // setAllowedOriginPatterns y no setAllowedOrigins: admite comodines como https://*.vercel.app
        // y es lo único compatible con allowCredentials(true).
        configuration.setAllowedOriginPatterns(origenesPermitidos());
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(Collections.singletonList("Authorization"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // Lista separada por comas, ignorando espacios y entradas vacías.
    private List<String> origenesPermitidos() {
        List<String> origenes = Arrays.stream(corsOrigins.split(","))
                .map(String::trim)
                .filter(o -> !o.isEmpty())
                .toList();
        if (origenes.isEmpty()) {
            log.warn("CORS_ORIGINS esta vacio. Usando origen por defecto: http://localhost:5174");
            return List.of("http://localhost:5174");
        }
        log.info("CORS habilitado para: {}", origenes);
        return origenes;
    }
}
