# GymOne

GymOne es una plataforma de gestión de gimnasios. El backend es Spring Boot 4.1
sobre Java 17 con PostgreSQL; el frontend es React 19 con Vite. El modelo de
dominio y los textos de usuario están en español.

## Requisitos previos

- JDK 17+
- Node 20+
- Docker

## Instalación del backend

1. `cd Backend/gym`
2. Copia el archivo de ejemplo: `cp .env.example .env` (PowerShell:
   `Copy-Item .env.example .env`)
3. Genera un secreto JWT con `openssl rand -base64 48` y ponlo en `.env` como
   `JWT_SECRET`. Define `ADMIN_PASSWORD` con una contraseña elegida.
4. `docker compose up -d` (opcional — con `spring.docker.compose.enabled=true`
   la propia app puede levantar el contenedor al arrancar).
5. `./mvnw spring-boot:run` — la API sirve en `http://localhost:8080/api`

## Instalación del frontend

```
cd Frontend
cp .env.example .env
npm install
npm run dev
```

Sirve en `http://localhost:5173`, que es el origen que permite
`app.cors.allowed-origin`.

## Primer inicio de sesión

El par `ADMIN_EMAIL` / `ADMIN_PASSWORD` siembra un usuario `ADMINISTRADOR`, y
solo cuando la tabla `usuarios` está vacía. Cambia esa contraseña una vez
tengas el login funcionando.

## Ejecutar pruebas

```
cd Backend/gym
./mvnw test
```

Requiere Docker (Testcontainers levanta un PostgreSQL desechable para las
pruebas de integración). El frontend todavía no tiene suite de pruebas.

## Variables de entorno

### Backend (`Backend/gym/.env`)

| Variable | Por defecto | Obligatoria |
|---|---|---|
| `DB_URL` | `jdbc:postgresql://localhost:5434/gymone_db` | no |
| `DB_USERNAME` | `gymone` | no |
| `DB_PASSWORD` | `gymone` | no |
| `JWT_SECRET` | — | **sí** |
| `JWT_EXPIRATION_MS` | `86400000` | no |
| `ADMIN_EMAIL` | `admin@gymone.local` | no |
| `ADMIN_PASSWORD` | — | **sí** |
| `MAIL_HOST` | `smtp.gmail.com` | no |
| `MAIL_PORT` | `587` | no |
| `MAIL_USERNAME` | — | no |
| `MAIL_PASSWORD` | — | no |
| `GEMINI_API_KEY` | — | no (sin ella el asistente queda desactivado) |

### Frontend (`Frontend/.env`)

| Variable | Por defecto | Obligatoria |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | no |
