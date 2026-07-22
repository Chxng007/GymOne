# Planes de implementación

Generados por la skill `improve` el 2026-07-21, contra el commit `8f78f50`.
Ejecuta en el orden de abajo salvo que las dependencias digan otra cosa. Cada
ejecutor: lee el plan completo antes de empezar, respeta sus condiciones de PARADA,
y actualiza su fila al terminar.

Los planes son autocontenidos: no hace falta haber visto la auditoría ni los demás
planes para ejecutar uno.

## Orden de ejecución y estado

| Plan | Título | Prioridad | Esfuerzo | Depende de | Estado |
|------|--------|-----------|----------|------------|--------|
| 001 | [Base de verificación del backend](001-base-de-verificacion.md) | P1 | M | — | HECHO |
| 002 | [Externalizar secretos y arreglar el datasource](002-externalizar-secretos-y-datasource.md) | P1 | S | — | HECHO |
| 003 | [Autorización por roles](003-autorizacion-por-roles.md) | P1 | M | 001 | HECHO (fuera del alcance original: `GlobalExceptionHandler.java` necesitó un handler para `AccessDeniedException` → 403, si no `@PreAuthorize` devolvía 500; prueba manual paso 7 no realizada — sin navegador en este entorno) |
| 004 | [Integrar caja con el flujo de dinero](004-integracion-caja-flujo-dinero.md) | P1 | M | 001 | HECHO (E2E verificado contra Postgres desechable, no contra el volumen dev real que ya tenía datos) |
| 005 | [Guardas de concurrencia en stock y caja](005-guardas-de-concurrencia.md) | P1 | S | 001 | TODO |
| 006 | [Interceptor 401 en el frontend](006-interceptor-401-frontend.md) | P2 | S | — | HECHO (lint/build OK; prueba manual en navegador no realizada — sin herramienta de navegador en este entorno) |

Valores de estado: TODO | EN CURSO | HECHO | BLOQUEADO (con una línea de motivo) |
RECHAZADO (con una línea de justificación).

## Notas de dependencias

- **001 va primero.** Hoy el repositorio no tiene forma de saber si funciona: el
  único archivo de prueba no afirma nada y necesita un PostgreSQL provisionado a
  mano para arrancar. Los planes 003, 004 y 005 cambian código de autorización o de
  dinero y su mitigación de riesgo son sus pruebas — sin 001 no hay dónde ponerlas.
- **002 y 006 no dependen de nadie** y pueden ejecutarse en paralelo con 001.
- **002 antes que 006 idealmente**: rotar `JWT_SECRET` (paso 6 del plan 002)
  invalida todos los tokens vigentes de golpe, y el plan 006 es justo lo que hace
  que esa desconexión masiva sea comprensible para el usuario en vez de parecer una
  aplicación rota.
- **004 y 005 tocan ambos `CajaService.java`.** Si se ejecutan en ramas separadas
  habrá conflicto de merge. Ejecuta uno, mézclalo, y luego el otro — el que vaya
  segundo debe volver a correr su chequeo de deriva.
- **003 y 006 tocan ambos el frontend** pero archivos distintos (`AppRoutes.jsx` /
  `Sidebar.jsx` frente a `api.js` / `AuthContext.jsx`). No hay conflicto.
- El plan 003 hace que el 403 sea una respuesta habitual; el plan 006 ignora el 403
  a propósito. Si se ejecutan los dos, verifica esa interacción (paso 5 del plan 006).

## Hallazgos planificados

Los seis planes cubren, en orden de la tabla de hallazgos de la auditoría:

1. Cero autorización — tres roles definidos, ninguno aplicado → **003**
2. Secretos versionados en git → **002**
3. Caja desconectada del flujo de dinero → **004**
4. Sin base de verificación → **001**
5. `compose.yaml` incompatible con la configuración de la app → **002**
6. Carrera de escritura perdida en el stock → **005**
7. Carrera de doble apertura de caja → **005**
8. Sin interceptor 401 en el frontend → **006**

## Hallazgos pendientes de planificar

Confirmados en la auditoría, sin plan escrito todavía. Están aquí para que no haya
que volver a auditarlos:

- **Sin paginación en ninguna parte** (esfuerzo L). Cada endpoint de listado
  devuelve la tabla entera; `Reportes.jsx:197-208` carga 9 colecciones completas.
  Cero uso de `Pageable` en el backend.
- **N+1 en el job horario y en caja** (esfuerzo S). `NotificacionService.java:75-122`
  consulta una vez por fila en cuatro bucles; `CajaService.java:119` consulta dentro
  de `toResponse`.
- **E/S de red bloqueante dentro de transacciones** (esfuerzo M).
  `PagoService.java:94` envía correo SMTP bajo el `@Transactional` de clase;
  `AsistenteService.java:27,35` llama a Gemini con `RestClient.create()` sin timeout
  ni reintento, y con el modelo fijado en el código.
- **Doble envío en "Cerrar caja"** (esfuerzo S). `Caja.jsx:81-90` no tiene guarda,
  mientras que sus dos handlers hermanos sí.
- **Esqueleto CRUD duplicado 13 veces** en el frontend, con tres formas
  incompatibles de manejar errores (esfuerzo M).
- **Sin límite de intentos en el login** (`AuthController.java:23-26`) y **registro
  público sin throttling ni CAPTCHA** (`RegistroPublicoController.java:17-46`).
- **JWT en localStorage sin CSP de respaldo**. El arreglo interino (cabecera CSP) es
  S; migrar a cookie `HttpOnly` es L y no se recomienda ahora.
- **`@Email` ausente** en `RegistroPublicoRequest.java:15`, `ClienteRequest.java:16`,
  `LoginRequest.java:6`.
- **PNG de 1,5 MB sin optimizar** bloqueando el pintado del login
  (`gym-hero.png`, usado en `Login.jsx:204-211`).
- **Sin CI** — `.github/` solo contiene hooks de modernización, no hay `workflows/`.
- **Suscripciones activas solapadas posibles** (`SuscripcionService.java:43-61`).
  Necesita decisión de producto antes de codificar.
- **`Login.jsx` de 478 líneas**, componente monolítico.

## Hallazgos considerados y rechazados

Para que nadie los vuelva a auditar:

- **Code-splitting del frontend**: ya está bien hecho. `React.lazy` en las 19
  páginas, `AppRoutes.jsx:9-22`.
- **`useMemo` / `useCallback` manuales**: el React Compiler está activado
  (`vite.config.js:2-10`), así que la memoización manual es ruido.
- **CSRF deshabilitado** (`SecurityConfig.java:53`): correcto para transporte por
  bearer token sin cookies.
- **Inyección SQL**: las dos únicas `@Query` del proyecto
  (`RutinaRepository.java:13`, `VentaRepository.java:18`) están parametrizadas.
- **Fuga de stack traces**: `GlobalExceptionHandler.java:60-65` registra en servidor
  y devuelve mensaje genérico.
- **`npm audit --omit=dev`**: 0 vulnerabilidades.
- **Spring Boot 4.1 con Java 17** y los nombres de artefacto
  `spring-boot-starter-webmvc` / `-webmvc-test` / `-security-test`: verificados
  correctos para Boot 4.x. No los "arregles".
- **Mass assignment en registro público**: no explotable —
  `RegistroPublicoController.java:28,39` fija `id` y `estado` a `null` en el código.
- **Formateador y pre-commit hooks, herramienta de auditoría de dependencias**:
  reales pero de poco valor con 5 commits de historia.

## No auditado

- Índices de base de datos. No hay archivos de migración
  (`ddl-auto=update`), así que el esquema es implícito.
- Lógica profunda de rutinas, entrenadores y asistencia.
