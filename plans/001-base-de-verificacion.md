# Plan 001: Establecer una base de pruebas ejecutable en el backend

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de PARADA", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (ejecútalo primero)**: `git diff --stat 8f78f50..HEAD -- Backend/gym/pom.xml Backend/gym/src/test Backend/gym/src/main/resources`
> Si algún archivo dentro del alcance cambió desde que se escribió este plan,
> compara los extractos de "Estado actual" contra el código vivo antes de
> continuar; ante cualquier diferencia, trátalo como condición de PARADA.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: M
- **Riesgo**: BAJO
- **Depende de**: ninguno
- **Categoría**: pruebas
- **Planificado en**: commit `8f78f50`, 2026-07-21

## Por qué importa

Este repositorio no tiene forma de saber si funciona. El único archivo de prueba no
afirma nada y ni siquiera arranca sin una base de datos PostgreSQL provisionada a
mano cuyo nombre, puerto, usuario y contraseña coincidan con valores fijados en el
código. Todos los demás planes de `plans/` modifican código de dinero o de
autorización, y ninguno se puede verificar con seguridad hasta que `mvnw test`
pase en limpio en una máquina nueva. Cuando este plan se aplique, `./mvnw test`
funcionará desde un clon fresco con solo tener Docker corriendo, y los planes
posteriores tendrán dónde poner sus pruebas.

## Estado actual

Archivos relevantes:

- `Backend/gym/pom.xml` — build de Maven. El padre es `spring-boot-starter-parent`
  4.1.0 y `java.version` es 17. Dependencias de prueba presentes hoy:
  `spring-boot-starter-security-test` y `spring-boot-starter-webmvc-test` (estos
  **son** los nombres correctos de artefacto en Spring Boot 4.x — NO los
  "corrijas" a `spring-boot-starter-test`). **No** hay Testcontainers ni H2.
- `Backend/gym/src/test/java/gymOne/gym/GymApplicationTests.java` — la única prueba.
- `Backend/gym/src/main/resources/application.properties` — configuración de
  desarrollo; contiene un datasource fijado apuntando a `localhost:5432`.
- No existe el directorio `src/test/resources/`.

`Backend/gym/src/test/java/gymOne/gym/GymApplicationTests.java` completo:

```java
package gymOne.gym;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class GymApplicationTests {

	@Test
	void contextLoads() {
	}

}
```

Dependencias de ámbito test en `Backend/gym/pom.xml` tal como están hoy
(líneas ~81–90):

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-security-test</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-starter-webmvc-test</artifactId>
			<scope>test</scope>
		</dependency>
```

Convenciones del repositorio a respetar:

- La raíz de paquetes es `gymOne.gym` (ojo: `g` minúscula, `O` mayúscula — es
  inusual, mantenlo).
- Las capas son `controller/` → `service/` → `repository/` → `entity/`, con `dto/`
  conteniendo `record` de Java. Los servicios llevan `@Service @Transactional` a
  nivel de clase — ver
  `Backend/gym/src/main/java/gymOne/gym/service/CajaService.java:22-24`.
- Los errores se señalan con
  `throw new ResponseStatusException(HttpStatus.X, "mensaje en español")`. Ver
  `CajaService.java:43`.
- El dominio y los textos de usuario están en español (`cliente`, `pago`, `caja`,
  `suscripcion`, `venta`, `gasto`, `asistencia`). Los nombres de métodos de prueba
  siguen el estilo Java existente; conserva los sustantivos del dominio en español.
- Wrapper de build: `Backend/gym/mvnw` (POSIX) y `Backend/gym/mvnw.cmd` (Windows).
  La máquina de desarrollo es Windows — prefiere `mvnw.cmd`.

## Comandos que necesitarás

Todos desde `Backend/gym/`.

| Propósito | Comando | Esperado si va bien |
|---|---|---|
| Compilar | `.\mvnw.cmd -B clean compile` | código 0, `BUILD SUCCESS` |
| Pruebas | `.\mvnw.cmd -B test` | código 0, `BUILD SUCCESS`, 0 fallos |
| Una prueba | `.\mvnw.cmd -B test -Dtest=CajaServiceTest` | código 0 |

En una shell POSIX sustituye `.\mvnw.cmd` por `./mvnw`.

Maven necesita acceso a la red la primera vez para descargar las dependencias
nuevas. Si la resolución falla por un error de red o de proxy, eso es una condición
de PARADA — no cambies a otra librería de pruebas para esquivarlo.

## Alcance

**Dentro del alcance** (los únicos archivos que debes modificar o crear):

- `Backend/gym/pom.xml` (modificar — solo añadir dependencias de prueba)
- `Backend/gym/src/test/resources/application-test.properties` (crear)
- `Backend/gym/src/test/java/gymOne/gym/GymApplicationTests.java` (modificar)
- `Backend/gym/src/test/java/gymOne/gym/service/CajaServiceTest.java` (crear)
- `Backend/gym/src/test/java/gymOne/gym/security/JwtUtilTest.java` (crear)

**Fuera del alcance** (NO tocar, aunque parezcan relacionados):

- `Backend/gym/src/main/resources/application.properties` — el datasource y los
  secretos fijados en ese archivo los aborda `plans/002-*.md`. Modificarlo aquí
  chocaría con ese plan. Tu configuración de prueba debe ser un archivo
  **separado** que lo sobreescriba, nunca una edición sobre él.
- Cualquier archivo bajo `Backend/gym/src/main/java/` — este plan solo añade
  pruebas y no debe cambiar comportamiento de producción. Si una prueba falla
  porque el código de producción tiene un fallo, eso es un hallazgo que informar,
  no un fallo que arreglar aquí (los planes posteriores los arreglan).
- Todo el directorio `Frontend/`.
- Los nombres de artefacto `spring-boot-starter-webmvc` /
  `spring-boot-starter-webmvc-test` / `spring-boot-starter-security-test` — son
  correctos para Spring Boot 4.x. Renombrarlos rompe el build.

## Flujo de git

- Rama: `advisor/001-base-de-verificacion`
- Un commit por paso está bien. Los mensajes existentes son frases sencillas en
  español (`subiendo mejoras`, `arreglando el diseño de toda la plataforma`); el
  repositorio no usa conventional commits. Escribe mensajes cortos y descriptivos.
- NO hagas push ni abras un PR salvo que el operador lo pida.

## Pasos

### Paso 1: Añadir las dependencias de Testcontainers

En `Backend/gym/pom.xml`, añade estas tres dependencias dentro del elemento
`<dependencies>` existente, justo después de `spring-boot-starter-webmvc-test`. No
elimines ni renombres nada de lo que ya está.

```xml
		<dependency>
			<groupId>org.springframework.boot</groupId>
			<artifactId>spring-boot-testcontainers</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>postgresql</artifactId>
			<scope>test</scope>
		</dependency>
		<dependency>
			<groupId>org.testcontainers</groupId>
			<artifactId>junit-jupiter</artifactId>
			<scope>test</scope>
		</dependency>
```

**No** pongas etiquetas `<version>` — el padre `spring-boot-starter-parent` 4.1.0
gestiona las versiones de Testcontainers. Si Maven reporta una versión faltante
para alguna de ellas, DETENTE e informa.

Añade `org.mockito:mockito-junit-jupiter` **solo si** los pasos siguientes no
compilan sin él; `spring-boot-starter-webmvc-test` debería traer Mockito de forma
transitiva. Compruébalo primero, no lo añadas por si acaso.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0, `BUILD SUCCESS`.

### Paso 2: Añadir un perfil de prueba que no toque la base de datos de desarrollo

Crea `Backend/gym/src/test/resources/application-test.properties` con exactamente
esto:

```properties
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.open-in-view=false
spring.docker.compose.enabled=false

jwt.secret=dGVzdC1vbmx5LXNpZ25pbmcta2V5LW5vdC11c2VkLWluLXByb2R1Y3Rpb24tMDEyMzQ1Njc4OQ==
jwt.expiration-ms=3600000

app.cors.allowed-origin=http://localhost:5173
app.admin.default-email=test-admin@example.invalid
app.admin.default-password=test-only-not-a-real-password

spring.mail.host=localhost
spring.mail.port=3025
spring.mail.username=
spring.mail.password=

gemini.api-key=
```

Notas para ti, el ejecutor:

- El `jwt.secret` de arriba es un valor base64 desechable que existe solo para que
  el contexto de prueba arranque. No es una credencial real y nunca debe
  reutilizarse fuera de las pruebas. `JwtUtil` exige un valor decodificable en
  base64 de al menos 256 bits para HMAC-SHA — ver
  `Backend/gym/src/main/java/gymOne/gym/security/JwtUtil.java:24`.
- Aquí no aparece ninguna propiedad `spring.datasource.*` a propósito. El Paso 3
  provee el datasource desde un contenedor PostgreSQL de Testcontainers mediante
  `@ServiceConnection`.

**Verificar**: el archivo existe —
`git status --short Backend/gym/src/test/resources/` lo muestra como archivo nuevo.

### Paso 3: Hacer que la prueba de contexto arranque contra un PostgreSQL desechable

Reemplaza el contenido de
`Backend/gym/src/test/java/gymOne/gym/GymApplicationTests.java` por una prueba que
levante un contenedor PostgreSQL 16 real (coincidiendo con `compose.yaml`, que fija
`postgres:16`), lo conecte con `@ServiceConnection`, active el perfil `test` y
además afirme algo.

Forma requerida:

- Clase anotada con `@SpringBootTest` y `@ActiveProfiles("test")`.
- Un campo `static @Container @ServiceConnection PostgreSQLContainer<?>` con la
  imagen `postgres:16`, y la clase anotada con `@Testcontainers`.
- La prueba `contextLoads` debe recibir un bean inyectado como parámetro (por
  ejemplo `gymOne.gym.service.CajaService`) y afirmar que no es nulo, para que
  falle en voz alta en vez de pasar vacía.

Importa `org.assertj.core.api.Assertions.assertThat` para las aserciones — AssertJ
viene con el starter de pruebas de Spring Boot y es la opción idiomática.

**Verificar**: `.\mvnw.cmd -B test -Dtest=GymApplicationTests` → código 0,
`Tests run: 1, Failures: 0, Errors: 0, Skipped: 0`.

Si este paso falla porque Docker no está corriendo, DETENTE e informa — no caigas
de vuelta a H2. H2 no ejercitaría el dialecto PostgreSQL que la aplicación usa de
verdad.

### Paso 4: Escribir una prueba unitaria para la aritmética de caja

Crea `Backend/gym/src/test/java/gymOne/gym/service/CajaServiceTest.java`.

Es una **prueba JUnit + Mockito pura, sin contexto de Spring** — debe correr en
milisegundos y no necesitar Docker. Construye `CajaService` directamente con mocks
de `CajaSesionRepository`, `CajaMovimientoRepository` y `UsuarioRepository` (ese es
el constructor en
`Backend/gym/src/main/java/gymOne/gym/service/CajaService.java:30-37`).

El comportamiento bajo prueba es `cerrar(Long sesionId)` en
`Backend/gym/src/main/java/gymOne/gym/service/CajaService.java:88-104`, que hoy dice:

```java
    public CajaSesionResponse cerrar(Long sesionId) {
        CajaSesion sesion = buscarSesionOFallar(sesionId);

        if (sesion.getEstado() == CajaSesion.EstadoCaja.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La caja ya está cerrada");
        }

        List<CajaMovimiento> movimientos = cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(sesionId);
        BigDecimal saldoFinal = sesion.getSaldoInicial().add(totalPorTipo(movimientos, CajaMovimiento.TipoMovimiento.INGRESO))
                .subtract(totalPorTipo(movimientos, CajaMovimiento.TipoMovimiento.EGRESO));

        sesion.setSaldoFinal(saldoFinal);
        sesion.setHoraCierre(java.time.LocalDateTime.now());
        sesion.setEstado(CajaSesion.EstadoCaja.CERRADA);

        return toResponse(cajaSesionRepository.save(sesion));
    }
```

Escribe estos cuatro casos:

1. `cerrarCalculaSaldoFinalConIngresosYEgresos` — sesión con `saldoInicial` 100,
   movimientos INGRESO 50 y EGRESO 20; afirma que el `saldoFinal` devuelto es 130
   (compara con `BigDecimal.compareTo` == 0, **no** con `equals`, porque la
   igualdad de `BigDecimal` es sensible a la escala: `new BigDecimal("130")` no es
   `.equals(new BigDecimal("130.00"))`).
2. `cerrarSinMovimientosDevuelveSaldoInicial` — sin movimientos; `saldoFinal` igual
   a `saldoInicial`.
3. `cerrarMarcaLaSesionComoCerrada` — afirma que `estado` es `CERRADA` y que
   `horaCierre` no es nulo tras la llamada.
4. `cerrarSesionYaCerradaLanzaConflict` — sesión ya `CERRADA`; afirma que se lanza
   `ResponseStatusException` cuyo `getStatusCode()` es `HttpStatus.CONFLICT`.

Ten en cuenta que `toResponse` vuelve a llamar internamente a
`cajaMovimientoRepository.findByCajaSesionIdOrderByFechaDesc(...)`
(`CajaService.java:119`), así que tu mock debe estar configurado para devolver la
lista de movimientos de esa sesión, no solo para la llamada de `cerrar`.

**Verificar**: `.\mvnw.cmd -B test -Dtest=CajaServiceTest` → código 0,
`Tests run: 4, Failures: 0, Errors: 0`.

### Paso 5: Escribir una prueba unitaria para la firma y validación de JWT

Crea `Backend/gym/src/test/java/gymOne/gym/security/JwtUtilTest.java`.

JUnit puro, sin contexto de Spring. `JwtUtil` tiene un constructor de dos
argumentos `JwtUtil(String secret, long expirationMs)` — ver
`Backend/gym/src/main/java/gymOne/gym/security/JwtUtil.java:22-28` — así que puedes
instanciarlo directamente. Usa el mismo secreto base64 desechable de
`application-test.properties` del Paso 2.

Casos:

1. `tokenGeneradoEsValidoYContieneElCorreo` — genera un token para
   `"alguien@example.invalid"`, afirma que `isTokenValid` es true y que
   `extractCorreo` devuelve esa dirección.
2. `tokenExpiradoNoEsValido` — construye un segundo `JwtUtil` con `expirationMs`
   negativo o cero para que el token nazca vencido, y afirma que `isTokenValid`
   devuelve false.
3. `tokenAlteradoNoEsValido` — toma un token válido, cambia un carácter del
   segmento de firma (la parte tras el último `.`), afirma que `isTokenValid`
   devuelve false.
4. `tokenFirmadoConOtraClaveNoEsValido` — genera un token con un `JwtUtil`
   construido sobre otro secreto base64, afirma que el `isTokenValid` de la
   primera instancia devuelve false.

**Verificar**: `.\mvnw.cmd -B test -Dtest=JwtUtilTest` → código 0,
`Tests run: 4, Failures: 0, Errors: 0`.

### Paso 6: Confirmar que toda la suite está en verde

**Verificar**: `.\mvnw.cmd -B clean test` → código 0, `BUILD SUCCESS`,
`Tests run: 9, Failures: 0, Errors: 0, Skipped: 0` en el resumen
(1 de contexto + 4 de caja + 4 de jwt).

## Plan de pruebas

Cubierto por los pasos 3–5. Resumen de lo que existe tras este plan:

| Archivo | Tipo | Necesita Docker | Casos |
|---|---|---|---|
| `GymApplicationTests.java` | `@SpringBootTest` + Testcontainers | sí | 1 |
| `service/CajaServiceTest.java` | unitaria + Mockito | no | 4 |
| `security/JwtUtilTest.java` | unitaria | no | 4 |

No hay ninguna prueba existente en este repositorio que sirva de patrón
estructural — la única es el esqueleto vacío que estás reemplazando.
`CajaServiceTest.java` pasa a ser el ejemplo al que apuntan los planes posteriores
para pruebas unitarias de servicio.

## Criterios de finalización

Comprobables por máquina. TODOS deben cumplirse:

- [ ] `.\mvnw.cmd -B clean test` (desde `Backend/gym/`) termina en 0 con 0 fallos y 0 errores
- [ ] `Backend/gym/src/test/resources/application-test.properties` existe
- [ ] `Backend/gym/src/test/java/gymOne/gym/service/CajaServiceTest.java` existe y sus 4 pruebas pasan
- [ ] `Backend/gym/src/test/java/gymOne/gym/security/JwtUtilTest.java` existe y sus 4 pruebas pasan
- [ ] `git diff --name-only 8f78f50..HEAD` solo lista archivos de la sección "Dentro del alcance"
- [ ] `git diff 8f78f50..HEAD -- Backend/gym/src/main/` está vacío (no se tocó código de producción)
- [ ] Fila de estado de 001 actualizada en `plans/README.md`

## Condiciones de PARADA

Detente e informa (no improvises) si:

- Docker no está disponible o el contenedor de PostgreSQL no arranca. No
  sustituyas por H2 ni por una base embebida — los planes posteriores dependen de
  que esta suite ejercite semántica real de PostgreSQL (restricciones únicas,
  bloqueo de filas).
- Maven no puede resolver las nuevas dependencias de Testcontainers desde la red.
- Alguno de los cuatro casos de `CajaServiceTest` falla porque la aritmética de
  *producción* en `CajaService.cerrar` está mal. Informa de la discrepancia; no
  modifiques `CajaService.java` — está fuera del alcance aquí.
- `.\mvnw.cmd -B clean compile` falla tras el Paso 1, lo que significaría que la
  suposición "el POM padre gestiona las versiones de Testcontainers" es falsa.
- Te ves necesitando editar `Backend/gym/src/main/resources/application.properties`.

## Notas de mantenimiento

- Los planes `002`, `003`, `004` y `005` añaden pruebas a esta suite. Mantén
  separadas las unitarias sin Docker de las de integración con Docker, como se
  establece aquí — la capa rápida es la que la gente va a ejecutar de verdad.
- La prueba de contexto es la única lenta. Si la suite pasa de ~30 segundos,
  considera un perfil de Maven que salte las pruebas `@Testcontainers` en local,
  pero manténlas corriendo en CI.
- Quien revise el PR debe fijarse en: que `application-test.properties` no se
  filtre a `src/main/resources`, y que no se haya modificado ningún archivo de
  producción.
- Diferido a propósito: pruebas de rebanada MockMvc para controladores. Pertenecen
  a `plans/003-autorizacion-por-roles.md`, que las necesita para su matriz de roles.
