# MercaditoLibre

Plataforma de comercio electrónico con catálogo de productos, carrito, gestión de
inventario y cobros con Stripe. Backend REST con Spring Boot y autenticación por JWT
con roles; frontend en React.

## Stack

| Capa | Tecnología |
|---|---|
| Backend | Spring Boot 3.5, Java 21, Spring Security + JWT, JPA/Hibernate |
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Base de datos | MySQL 8.4 |
| Pagos | Stripe (modo test) |
| Despliegue | Docker Compose, nginx como reverse proxy |

## Levantarlo

Requiere solo Docker. No hace falta Java, Node ni MySQL instalados.

```bash
cd deploy
cp .env.example .env      # rellena STRIPE_* y las contraseñas
docker compose up -d --build
```

Queda en http://localhost:8084. La primera vez tarda unos minutos porque compila el
JAR y el bundle de Vite dentro de las imágenes.

La base de datos se carga sola: `deploy/initdb/01-mercadito.sql` trae el esquema y
datos de ejemplo (8 productos, 5 categorías, ventas de prueba), y MySQL lo ejecuta al
crear el volumen por primera vez.

### Credenciales de demostración

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `juanperez` | `juan123` | CLIENTE |

Son datos de demo. En cualquier despliegue real hay que cambiarlas.

## Arquitectura

```
Internet → :8084 → [web] nginx ─┬─ /      → bundle de Vite (estático)
                                └─ /api/  → [app] Spring Boot :8085
                                                  └─ [db] MySQL 8.4
```

nginx sirve el frontend y reenvía `/api` al backend, así que todo va por el mismo
origen y el frontend usa rutas relativas — no hay URLs de API que cambiar entre
entornos. Solo el puerto de nginx se publica: la API y la base de datos quedan en la
red interna de Docker.

Las imágenes de producto se guardan como BLOB en la base de datos, no en disco, así
que no hay volumen de subidas que respaldar aparte.

## Estructura

```
├── mercaditolibre/              backend Spring Boot
├── mercaditolibre_frontend/
│   └── cloud-commerce-ui/       frontend React + nginx.conf
└── deploy/
    ├── docker-compose.yml       build local
    ├── docker-compose.prod.yml  usa imágenes ya construidas
    ├── initdb/                  esquema y datos iniciales
    ├── exportar.ps1             empaqueta las imágenes en un .tar.gz
    ├── subir.ps1                despliega esas imágenes en un servidor
    └── subir-fuente.ps1         sube el fuente y compila en el servidor
```

## Variables de entorno

Todas se documentan en `deploy/.env.example`. Las que no tienen valor por defecto
seguro:

| Variable | Para qué |
|---|---|
| `JWT_SECRET` | Firma de los tokens. HS256 exige 32+ caracteres. |
| `DB_PASSWORD` / `MYSQL_ROOT_PASSWORD` | Credenciales de MySQL. |
| `STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY` | Ambas de la misma cuenta y el mismo modo. |
| `CORS_ORIGINS` | Origen del frontend. En producción, el dominio real. |
| `PAGOS_SIMULADOR` | Marca ventas como pagadas sin cobrar. Solo para demos locales. |

Los `.env` reales están en `.gitignore` y no deben subirse nunca.

## Desarrollo sin Docker

Backend en el puerto 8085:

```bash
cd mercaditolibre
./mvnw spring-boot:run
```

Frontend en el 5174, con proxy de `/api` al backend:

```bash
cd mercaditolibre_frontend/cloud-commerce-ui
pnpm install && pnpm dev
```

Requiere un MySQL local escuchando en el 3306 y las variables de entorno definidas.

## Requisitos de memoria

El stack completo pide unos 600 MB de RAM: MySQL ~200, la JVM ~350 y nginx ~5. Los
límites en el compose lo topan en 1216 MB. Un servidor de 1 GB no alcanza; 2 GB
funciona si no comparte la máquina con otros servicios.
