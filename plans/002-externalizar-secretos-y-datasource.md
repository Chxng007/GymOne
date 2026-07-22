# Plan 002: Externalizar las credenciales versionadas y hacer que `compose.yaml` funcione

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de PARADA", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (ejecútalo primero)**: `git diff --stat 8f78f50..HEAD -- Backend/gym/src/main/resources/application.properties Backend/gym/compose.yaml Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java`
> Si algún archivo dentro del alcance cambió desde que se escribió este plan,
> compara los extractos de "Estado actual" contra el código vivo antes de
> continuar; ante cualquier diferencia, trátalo como condición de PARADA.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: S
- **Riesgo**: BAJO
- **Depende de**: ninguno (pero ejecuta antes `plans/001-base-de-verificacion.md` si quieres que la suite confirme que nada se rompió)
- **Categoría**: seguridad
- **Planificado en**: commit `8f78f50`, 2026-07-21

## Por qué importa

Hay tres credenciales vivas versionadas en git dentro de un archivo rastreado: la
contraseña de PostgreSQL, el secreto de firma del JWT y la contraseña del
administrador inicial. Cualquiera con acceso al repositorio — ahora o en cualquier
clon, fork o log de CI futuro — puede emitir tokens de administrador válidos contra
cualquier despliegue que siga usando esos valores.

Por separado, el PostgreSQL que viene en `compose.yaml` usa un puerto, un nombre de
base de datos, un usuario y una contraseña completamente distintos de aquellos a los
que la aplicación intenta conectarse, así que quien siga el camino obvio de
instalación (`docker compose up` y luego arrancar la app) obtiene un fallo de
conexión sin nada que lo explique.

Este plan mueve las tres credenciales a variables de entorno, alinea la aplicación
con su propio archivo compose, y añade el `.env.example` y el README que hacen
descubrible la instalación.

**La rotación es obligatoria, no opcional.** Borrar un secreto de un archivo no lo
des-filtra: sigue en el historial de git. El Paso 6 se ocupa de esto.

## Estado actual

Archivos relevantes:

- `Backend/gym/src/main/resources/application.properties` — rastreado por git.
  Contiene las credenciales del datasource (líneas 5–7), el secreto de firma del
  JWT (línea 19) y la contraseña del administrador semilla (línea 23) como valores
  literales. Nota que las opciones de correo y de Gemini en el mismo archivo
  (líneas 25–30) **ya** usan el patrón correcto `${VAR:defecto}` — copia ese estilo.
- `Backend/gym/compose.yaml` — define el PostgreSQL de desarrollo.
- `Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java` — crea el primer
  administrador al arrancar con la base vacía, y escribe la contraseña en claro en
  el log.
- `Backend/gym/HELP.md` — archivo estándar de Spring Initializr cuyo aviso sobre
  Docker Compose hoy es factualmente falso.
- `Frontend/.env` — correctamente ignorado por git (`Frontend/.gitignore:13`);
  contiene solo `VITE_API_URL`, que no es un secreto. No hay un `.env.example` al
  lado.

El desajuste, lado a lado:

`Backend/gym/compose.yaml` (archivo completo):

```yaml
services:
  postgres:
    image: postgres:16
    container_name: gymone-postgres
    environment:
      POSTGRES_DB: gymone_db
      POSTGRES_USER: gymone
      POSTGRES_PASSWORD: gymone
    ports:
      - "5434:5432"
    volumes:
      - gymone_postgres_data:/var/lib/postgresql/data

volumes:
  gymone_postgres_data:
```

`Backend/gym/src/main/resources/application.properties`, líneas 5–13 (el valor de
la contraseña va censurado aquí — léelo en el archivo real):

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/gymOne
spring.datasource.username=postgres
spring.datasource.password=<literal fijado — ver el archivo>

spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.open-in-view=false

spring.docker.compose.enabled=false
```

Es decir: compose publica el puerto **5434**, base **gymone_db**, usuario
**gymone**; la app marca el puerto **5432**, base **gymOne**, usuario **postgres**.
Nada conecta. `spring-boot-docker-compose` está en el classpath (`pom.xml`, ámbito
runtime) pero la línea 13 lo desactiva.

El patrón a imitar, ya presente en el mismo archivo en las líneas 25–30:

```properties
spring.mail.host=${MAIL_HOST:smtp.gmail.com}
spring.mail.port=${MAIL_PORT:587}
spring.mail.username=${MAIL_USERNAME:}
spring.mail.password=${MAIL_PASSWORD:}
```

`Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java:32-52` tal como está
hoy:

```java
    @Override
    public void run(String... args) {
        if (usuarioRepository.count() > 0) {
            return;
        }

        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setCorreo(defaultAdminEmail);
        admin.setContrasenaHash(passwordEncoder.encode(defaultAdminPassword));
        admin.setRol(Usuario.Rol.ADMINISTRADOR);
        admin.setActivo(true);
        usuarioRepository.save(admin);

        log.info("========================================================");
        log.info(" Usuario administrador creado (Fase 1 - seed inicial)");
        log.info(" Correo:      {}", defaultAdminEmail);
        log.info(" Contrasena:  {}", defaultAdminPassword);
        log.info(" Cambia esta contrasena una vez tengas login funcionando.");
        log.info("========================================================");
    }
```

La línea 49 escribe la contraseña del administrador en claro en el log.

Convenciones del repositorio: los mensajes de log y los textos de usuario están en
español; mantenlos en español.

## Comandos que necesitarás

| Propósito | Comando | Desde | Esperado si va bien |
|---|---|---|---|
| Compilar | `.\mvnw.cmd -B clean compile` | `Backend/gym/` | código 0, `BUILD SUCCESS` |
| Pruebas | `.\mvnw.cmd -B test` | `Backend/gym/` | código 0 (solo significativo tras el plan 001) |
| Levantar BD | `docker compose -f Backend/gym/compose.yaml up -d` | raíz del repo | contenedor `gymone-postgres` en marcha |
| Parar BD | `docker compose -f Backend/gym/compose.yaml down` | raíz del repo | código 0 |
| Ver rastreados | `git ls-files Backend/gym/src/main/resources/` | raíz del repo | lista los archivos de propiedades |

En una shell POSIX sustituye `.\mvnw.cmd` por `./mvnw`.

## Alcance

**Dentro del alcance**:

- `Backend/gym/src/main/resources/application.properties` (modificar)
- `Backend/gym/.env.example` (crear)
- `Frontend/.env.example` (crear)
- `Backend/gym/.gitignore` (modificar — añadir `.env`)
- `Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java` (modificar — solo el log)
- `README.md` en la raíz del repositorio (crear)
- `Backend/gym/HELP.md` (eliminar)

**Fuera del alcance** (NO tocar, aunque parezcan relacionados):

- `Backend/gym/compose.yaml` — es internamente consistente y es el conjunto de
  valores al que todo lo demás se va a alinear. No cambies su puerto, ni el nombre
  de base, ni las credenciales; la app se mueve hacia él, no al revés.
- `Backend/gym/src/test/resources/application-test.properties` (si el plan 001 ya
  lo creó) — el perfil de prueba es deliberadamente independiente de estas
  variables.
- `Frontend/.env` — ya está ignorado y no contiene ningún secreto. Crea el
  `.example` al lado; no modifiques ni elimines el archivo real.
- Cualquier reescritura del historial de git (`git filter-repo`, BFG, force-push).
  Sacar los secretos del historial es una decisión aparte del operador con coste
  real de coordinación; este plan usa la rotación en su lugar. Ver el Paso 6.
- Cualquier archivo de `Backend/gym/src/main/java/` que no sea `DataSeeder.java`, y
  dentro de ese archivo, cualquier cosa que no sea el bloque de log.

## Flujo de git

- Rama: `advisor/002-externalizar-secretos`
- Un commit por paso o por unidad lógica. Los mensajes existentes son frases
  sencillas en español sin prefijo de conventional commits — sigue ese estilo.
- NO hagas push ni abras un PR salvo que el operador lo pida. **No pegues ningún
  valor de secreto en un mensaje de commit, en el cuerpo de un PR o en un issue.**

## Pasos

### Paso 1: Mover las tres credenciales a variables de entorno

Edita `Backend/gym/src/main/resources/application.properties`.

Reemplaza el bloque del datasource para que por defecto apunte a los valores que
`compose.yaml` publica de verdad, permitiendo sobreescritura desde el entorno:

```properties
spring.datasource.url=${DB_URL:jdbc:postgresql://localhost:5434/gymone_db}
spring.datasource.username=${DB_USERNAME:gymone}
spring.datasource.password=${DB_PASSWORD:gymone}
```

Reemplaza las líneas de JWT y de semilla de administrador de modo que **no tengan
valor por defecto** — la aplicación debe negarse a arrancar antes que funcionar con
un secreto públicamente conocido:

```properties
jwt.secret=${JWT_SECRET}
jwt.expiration-ms=${JWT_EXPIRATION_MS:86400000}

app.admin.default-email=${ADMIN_EMAIL:admin@gymone.local}
app.admin.default-password=${ADMIN_PASSWORD}
```

Deja sin cambios `spring.application.name`, `server.port`, las tres líneas
`spring.jpa.*`, `app.cors.allowed-origin`, el bloque `spring.mail.*` y
`gemini.api-key`.

Los valores por defecto de compose son de conveniencia solo para desarrollo, contra
un contenedor que no es accesible desde fuera de la máquina. `JWT_SECRET` y
`ADMIN_PASSWORD` no tienen fallback a propósito: si falta el valor, el arranque
falla, que es el comportamiento correcto.

**Verificar**: `grep -n 'jwt.secret\|datasource\|admin.default' Backend/gym/src/main/resources/application.properties`
→ toda línea coincidente contiene `${` y ninguna contiene una contraseña o clave
literal.

### Paso 2: Activar la integración de Docker Compose de Spring

En el mismo archivo, cambia:

```properties
spring.docker.compose.enabled=false
```

por:

```properties
spring.docker.compose.enabled=${DOCKER_COMPOSE_ENABLED:true}
```

`spring-boot-docker-compose` ya es dependencia de runtime en `pom.xml`, así que con
esto activado la app arranca `compose.yaml` por sí misma e inyecta los datos de
conexión automáticamente. Los valores explícitos `spring.datasource.*` del Paso 1
siguen como respaldo para quien ejecute PostgreSQL fuera de Docker, y la variable
permite desactivarlo en CI.

**Verificar**: con Docker corriendo, desde `Backend/gym/` ejecuta
`.\mvnw.cmd -B spring-boot:run` con `JWT_SECRET` y `ADMIN_PASSWORD` definidas en el
entorno (ver el Paso 3 para generarlas) → el log muestra que Spring arranca el
servicio de compose y la aplicación llega a
`Started GymApplication in ... seconds` sin `Connection refused`. Párala con Ctrl+C.

### Paso 3: Añadir los `.env.example` documentando cada variable requerida

Crea `Backend/gym/.env.example` con valores de marcador únicamente — **nunca
valores reales**:

```dotenv
# Copia a .env y rellena. Nunca subas .env al repositorio.
# Datasource — los valores por defecto coinciden con compose.yaml.
DB_URL=jdbc:postgresql://localhost:5434/gymone_db
DB_USERNAME=gymone
DB_PASSWORD=gymone

# OBLIGATORIO, sin valor por defecto. Codificado en base64, mínimo 32 bytes (256 bits).
# Genera uno con:  openssl rand -base64 48
JWT_SECRET=
JWT_EXPIRATION_MS=86400000

# OBLIGATORIO, sin valor por defecto. Se usa una sola vez, cuando la tabla usuarios está vacía.
ADMIN_EMAIL=admin@gymone.local
ADMIN_PASSWORD=

# Opcional — correo saliente para las confirmaciones de pago.
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=

# Opcional — el asistente de la aplicación queda desactivado sin esta clave.
GEMINI_API_KEY=
```

Crea `Frontend/.env.example`:

```dotenv
# Copia a .env. Vite expone toda variable VITE_* al bundle del navegador —
# nunca pongas un secreto aquí.
VITE_API_URL=http://localhost:8080/api
```

Añade `.env` a `Backend/gym/.gitignore` si no está ya cubierto (revisa primero el
contenido existente; no dupliques una regla que ya exista).

**Verificar**: `git check-ignore -v Backend/gym/.env` → imprime la regla de ignorado
que coincide (crea un `Backend/gym/.env` vacío para probarlo y bórralo después). Y
`git status --short` muestra los dos `.env.example` como nuevos, sin ningún archivo
`.env` preparado para commit.

### Paso 4: Dejar de escribir la contraseña del administrador en el log

En `Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java`, elimina la línea
que registra el valor de la contraseña:

```java
        log.info(" Contrasena:  {}", defaultAdminPassword);
```

Reemplaza el bloque de log completo por uno que confirme la creación sin revelar la
credencial. Mantenlo en español, siguiendo el estilo del archivo:

```java
        log.info("========================================================");
        log.info(" Usuario administrador creado (seed inicial)");
        log.info(" Correo: {}", defaultAdminEmail);
        log.info(" Contrasena: la del entorno (ADMIN_PASSWORD). Cambiala tras el primer login.");
        log.info("========================================================");
```

No cambies nada más en este archivo — la guarda `usuarioRepository.count() > 0`, la
construcción del `Usuario` y los nombres de los campos `@Value` se quedan
exactamente igual.

**Verificar**: `grep -n 'defaultAdminPassword' Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java`
→ quedan exactamente dos coincidencias: la declaración del campo anotado con
`@Value` y su uso dentro de `passwordEncoder.encode(...)`. Ninguna línea `log.` lo
referencia.

### Paso 5: Escribir el README raíz y eliminar el HELP.md obsoleto

Crea `README.md` en la raíz del repositorio. Debe contener como mínimo:

- Un párrafo: GymOne es una plataforma de gestión de gimnasios. El backend es
  Spring Boot 4.1 sobre Java 17 con PostgreSQL; el frontend es React 19 con Vite.
  El modelo de dominio y los textos de usuario están en español.
- **Requisitos previos**: JDK 17+, Node 20+, Docker.
- **Instalación del backend**, con comandos literales copiables:
  1. `cd Backend/gym`
  2. `cp .env.example .env` (PowerShell: `Copy-Item .env.example .env`)
  3. Generar un secreto JWT con `openssl rand -base64 48` y ponerlo en `.env` como
     `JWT_SECRET`; definir `ADMIN_PASSWORD` con una contraseña elegida.
  4. `docker compose up -d` (o dejar que la app lo arranque —
     `spring.docker.compose.enabled` ahora viene en `true`)
  5. `./mvnw spring-boot:run` — la API sirve en `http://localhost:8080/api`
- **Instalación del frontend**: `cd Frontend`, `cp .env.example .env`,
  `npm install`, `npm run dev` — sirve en `http://localhost:5173`, que es el origen
  que permite `app.cors.allowed-origin`.
- **Primer inicio de sesión**: el par `ADMIN_EMAIL` / `ADMIN_PASSWORD` siembra un
  usuario `ADMINISTRADOR`, y solo cuando la tabla `usuarios` está vacía. Indica al
  lector que la cambie tras el primer login.
- **Ejecutar pruebas**: `cd Backend/gym && ./mvnw test` (requiere Docker). Anota
  que el frontend todavía no tiene suite de pruebas.
- **Una tabla con todas las variables de entorno**, su valor por defecto y si son
  obligatorias — reflejando los dos `.env.example`.

No pongas ninguna credencial real en el README.

Después elimina `Backend/gym/HELP.md`. Es el archivo estándar de Spring Initializr
sin tocar y su aviso sobre Docker Compose ("No Docker Compose services found... the
application won't start!") ahora es falso, ya que `compose.yaml` sí define un
servicio `postgres` y el Paso 2 activó la integración.

**Verificar**: `test -f README.md && test ! -f Backend/gym/HELP.md` → código 0.
(PowerShell: `(Test-Path README.md) -and -not (Test-Path Backend/gym/HELP.md)` → `True`.)

### Paso 6: Informar la lista de rotación — no la ejecutes tú

Los valores antiguos siguen en el historial de git en el commit `8f78f50` y
anteriores. Quitarlos del árbol de trabajo no los revoca.

Escribe lo siguiente como informe final al operador (no intentes hacer nada de esto
tú mismo, y no incluyas ningún valor de secreto en el informe):

1. **Contraseña de PostgreSQL** — si alguna base de datos desplegada o compartida
   usó la contraseña versionada, cámbiala ahí ahora. La instancia local de Docker es
   desechable; solo importan los despliegues reales.
2. **Secreto de firma del JWT** — genera uno nuevo (`openssl rand -base64 48`) para
   cada entorno. Rotarlo invalida todos los tokens vigentes, así que todos los
   usuarios quedan desconectados una vez; ese es el efecto buscado y es justamente
   el objetivo.
3. **Contraseña del administrador inicial** — si algún despliegue arrancó alguna vez
   con la tabla `usuarios` vacía, existe una cuenta `ADMINISTRADOR` con la
   contraseña versionada. Cámbiala desde la aplicación, o borra y vuelve a sembrar
   esa cuenta.
4. **Opcional, decisión del operador**: purgar los valores del historial de git con
   `git filter-repo` o BFG. Eso reescribe todos los SHA de commit y obliga a todo el
   mundo a volver a clonar. Deliberadamente fuera del alcance de este plan.

**Verificar**: tu informe al operador lista los cuatro puntos y no contiene ningún
valor de credencial.

### Paso 7: Confirmar que no hubo regresiones

**Verificar**: desde `Backend/gym/`, `.\mvnw.cmd -B clean test` → código 0. Si el
plan 001 todavía no se aplicó, la suite está casi vacía; en ese caso verifica que
`.\mvnw.cmd -B clean compile` termina en 0 y que la app arranca como en el Paso 2.

Confirma además que la aplicación **se niega** a arrancar sin las variables
obligatorias: quita `JWT_SECRET` del entorno y ejecuta
`.\mvnw.cmd -B spring-boot:run` → el arranque falla con un error que menciona
`jwt.secret`. Ese fallo es el comportamiento deseado; restaura la variable después.

## Plan de pruebas

Este plan es de configuración; la verificación relevante es de comportamiento, no
unitaria:

- El arranque con todas las variables definidas conecta con la base de compose
  (Paso 2).
- El arranque sin `JWT_SECRET` falla rápido (Paso 7).
- No se requieren pruebas automatizadas nuevas. Si el plan 001 ya se aplicó, su
  suite debe seguir pasando — `application-test.properties` aporta su propio
  `jwt.secret`, así que eliminar el valor por defecto aquí no le afecta. Si el plan
  001 **no** se aplicó y te ves creando configuración de prueba para que algo pase,
  DETENTE: ejecuta antes el plan 001.

## Criterios de finalización

Comprobables por máquina. TODOS deben cumplirse:

- [ ] `grep -nE 'jwt\.secret|datasource\.password|admin\.default-password' Backend/gym/src/main/resources/application.properties` — toda coincidencia usa `${...}`, ninguna contiene un literal
- [ ] `grep -c 'log.*defaultAdminPassword' Backend/gym/src/main/java/gymOne/gym/config/DataSeeder.java` devuelve 0
- [ ] `Backend/gym/.env.example` y `Frontend/.env.example` existen y no contienen ningún secreto rellenado
- [ ] `git check-ignore Backend/gym/.env` termina en 0
- [ ] `README.md` existe en la raíz; `Backend/gym/HELP.md` no existe
- [ ] `.\mvnw.cmd -B clean compile` (desde `Backend/gym/`) termina en 0
- [ ] La aplicación arranca contra la base de `compose.yaml` con las variables documentadas
- [ ] `git status --short` no muestra ningún archivo `.env` preparado ni versionado
- [ ] La lista de rotación del Paso 6 se informó al operador
- [ ] Fila de estado de 002 actualizada en `plans/README.md`

## Condiciones de PARADA

Detente e informa (no improvises) si:

- Existe un entorno desplegado (staging, producción, una demo alojada) que hoy
  depende de las coordenadas antiguas `localhost:5432` / `gymOne` / `postgres`.
  Cambiar los valores por defecto podría romperlo. Confírmalo con el operador antes
  de pasar del Paso 1.
- La aplicación no arranca tras el Paso 2 por cualquier motivo que no sea una
  variable de entorno faltante.
- Encuentras credenciales adicionales en archivos que este plan no lista. Informa
  del `file:line` y del *tipo* de credencial únicamente — nunca del valor.
- Te ves tentado a reescribir el historial de git. Está explícitamente fuera del
  alcance.
- Resulta que `Backend/gym/compose.yaml` está referenciado por un job de CI o un
  script de despliegue que desconocías, de forma que cambiar el puerto destino de la
  app importe.

## Notas de mantenimiento

- Quien añada una nueva opción secreta debe añadirla **tanto** al `.env.example`
  como a la tabla de variables del README, y debe usar `${VAR}` sin valor por
  defecto si es una credencial.
- El valor por defecto `true` de `spring.docker.compose.enabled` hace que la app
  intente manejar Docker en cada arranque local. CI debe definir
  `DOCKER_COMPOSE_ENABLED=false`, o usar el perfil `test` que ya lo pone en false.
- Quien revise el PR debe fijarse en: que no sobreviva ninguna credencial literal en
  `src/main/resources`, que `.env` esté ignorado, y que los comandos copiables del
  README se hayan ejecutado de verdad y funcionen.
- Diferido a propósito: la purga del historial de git (decisión del operador, punto
  4 del Paso 6) y un gestor de secretos para producción — las variables de entorno
  son el paso correcto para un proyecto en esta etapa.
