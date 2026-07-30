# Despliegue en droplet (Docker)

```
Internet → :8084 → [web] nginx ─┬─ /      → dist de Vite
                                └─ /api/  → [app] Spring Boot :8085
                                                  └─ [db] MySQL 8.4 :3306
```

Los tres contenedores viven en su propia red. Solo el `8084` queda expuesto: ni la API
ni MySQL son alcanzables desde fuera. No usa el nginx ni el MySQL del sistema, así que
no choca con lo que otros del equipo tengan corriendo en el droplet.

El frontend llama la API con rutas relativas (`/api/v1/...`) y nginx la reenvía, así que
todo es mismo origen y no hay que tocar código para cambiar de entorno.

## Primera vez

1. En local: copia `.env.example` como `.env` y rellena los valores.
2. Prueba en local: `docker compose up -d --build` → http://localhost:8084
3. Empaqueta: `.\exportar.ps1`
4. En el droplet: instala Docker y crea `/opt/mercadito/.env` (mismo contenido, con
   `CORS_ORIGINS` apuntando a la IP real).
5. Sube y levanta: `.\subir.ps1 -Servidor root@IP`

## Redespliegues

```
.\exportar.ps1
.\subir.ps1 -Servidor root@IP
```

El `.env` del droplet no se sobrescribe: se crea una vez y se queda.

## Comandos útiles en el droplet

```
cd /opt/mercadito
docker compose ps
docker compose logs -f app
docker compose restart app
docker compose down          # apaga sin borrar la BD
docker compose down -v       # OJO: borra el volumen y con el la BD
```

## Notas

- Las imágenes de producto se guardan en la BD (`@Lob`), no en disco: no hay volumen de
  uploads que respaldar, solo `mercadito_db_data`.
- `client_max_body_size 5M` en `nginx.conf` es obligatorio; el default de 1M rompe la
  subida de imágenes de 3 MB.
- Docker publica el puerto vía iptables y **se salta ufw**. El 8084 queda abierto aunque
  ufw no lo permita explícitamente.
- Respaldo de la BD:
  `docker compose exec db mysqldump -u root -pPASS mercaditoLibre_db > backup.sql`
