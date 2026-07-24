# GymOne — Guía de Docker

Este proyecto se levanta completo con Docker Compose: PostgreSQL, pgAdmin, el backend (Spring Boot) y el frontend (React + Vite servido con nginx).

## Requisitos

- Docker Desktop (o Docker Engine + Compose plugin) instalado y corriendo.

## Primer uso

1. Copiar el archivo de variables de entorno de ejemplo:

   ```bash
   cp .env.example .env
   ```

2. Editar `.env` y cambiar como mínimo las contraseñas y el `JWT_SECRET` antes de usar esto en un entorno real (los valores de `.env.example` son solo para desarrollo local).

3. Levantar todo:

   ```bash
   docker compose up -d --build
   ```

4. Verificar que los 4 contenedores estén arriba:

   ```bash
   docker compose ps
   ```

## Accesos

| Servicio | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend (API) | http://localhost:8080 |
| pgAdmin | http://localhost:5050 |
| PostgreSQL | localhost:5434 (desde un cliente externo al host) |

Las credenciales de cada uno salen de las variables definidas en `.env` (ver `.env.example` para la lista completa). Este repo no versiona `.env` ni contraseñas reales.

## Tres credenciales distintas — no confundirlas

Es fácil mezclarlas porque las tres viven en el mismo `.env`, pero son cosas separadas:

| Para qué sirve | Variables en `.env` | Dónde se usa |
|---|---|---|
| Iniciar sesión en la app | `APP_ADMIN_DEFAULT_EMAIL` / `APP_ADMIN_DEFAULT_PASSWORD` | Formulario de login en http://localhost:5173 |
| Iniciar sesión en pgAdmin | `PGADMIN_DEFAULT_EMAIL` / `PGADMIN_DEFAULT_PASSWORD` | Pantalla de login de http://localhost:5050 |
| Conectar pgAdmin a la base de datos | `POSTGRES_USER` / `POSTGRES_PASSWORD` | Al registrar el servidor **dentro** de pgAdmin (no es el login de pgAdmin) |

## Conectar pgAdmin a la base de datos Postgres

El servidor **"GymOne (Docker)"** ya viene pre-cargado automáticamente (definido en `pgadmin/servers.json`, montado dentro del contenedor). Al entrar a pgAdmin vas a verlo listado en el panel izquierdo bajo **Servers**; solo falta:

1. Click en **GymOne (Docker)**.
2. Te pide la contraseña de conexión → es el valor de `POSTGRES_PASSWORD` (no el login de pgAdmin).
3. Tildar "Save password" si no querés que te la pida de nuevo.

Si en vez de eso preferís registrarlo a mano (o cambiaste `POSTGRES_DB`/`POSTGRES_USER` en `.env` y el pre-cargado ya no aplica), click derecho en **Servers** → **Register** → **Server...**:

- Pestaña **General** → Name: el que quieras.
- Pestaña **Connection**:
  - **Host name/address**: `postgres` (el nombre del servicio en `docker-compose.yml`, **no** `localhost` — pgAdmin corre en otro contenedor y `localhost` ahí adentro no es tu PC).
  - **Port**: `5432`
  - **Maintenance database**: valor de `POSTGRES_DB`
  - **Username**: valor de `POSTGRES_USER`
  - **Password**: valor de `POSTGRES_PASSWORD`

> Nota: el pre-cargado (`pgadmin/servers.json`) solo se importa la primera vez que arranca pgAdmin con un volumen de datos vacío. Si ya usaste pgAdmin antes y no ves el servidor, corré `docker compose down -v` (borra los datos de postgres y pgadmin) y volvé a levantar — o registralo a mano como se explica arriba.

## Sobre el usuario administrador de la app

El usuario admin se crea una única vez, cuando el backend arranca contra una base de datos vacía (`DataSeeder.java`). Si más adelante cambiás `APP_ADMIN_DEFAULT_EMAIL` / `APP_ADMIN_DEFAULT_PASSWORD` en `.env`, el cambio **no** se aplica solo, porque el seeder solo corre si la tabla `usuarios` está vacía.

Para resetear el usuario admin (¡esto borra todos los datos!):

```bash
docker compose down -v
docker compose up -d --build
```

## Comandos útiles

```bash
docker compose up -d --build   # construir y levantar todo
docker compose logs -f backend # ver logs del backend en vivo
docker compose ps              # estado de los contenedores
docker compose down            # detener (conserva los datos en volúmenes)
docker compose down -v         # detener y borrar los datos de postgres/pgadmin
```

## Variables de entorno

Ver `.env.example` en la raíz del proyecto para la lista completa con valores por defecto de desarrollo. En producción, cada una debe sobrescribirse con valores propios (especialmente contraseñas y `JWT_SECRET`).
