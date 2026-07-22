# Plan 005: Cerrar las dos condiciones de carrera de stock y caja

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de PARADA", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (ejecútalo primero)**: `git diff --stat 8f78f50..HEAD -- Backend/gym/src/main/java/gymOne/gym/entity/Producto.java Backend/gym/src/main/java/gymOne/gym/entity/CajaSesion.java Backend/gym/src/main/java/gymOne/gym/service/VentaService.java Backend/gym/src/main/java/gymOne/gym/service/CajaService.java`
> Si algún archivo dentro del alcance cambió desde que se escribió este plan,
> compara los extractos de "Estado actual" contra el código vivo antes de
> continuar; ante cualquier diferencia, trátalo como condición de PARADA.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: S
- **Riesgo**: BAJO — los cambios solo actúan cuando hoy ya habría corrupción silenciosa
- **Depende de**: `plans/001-verification-baseline.md` (las pruebas de concurrencia necesitan PostgreSQL real vía Testcontainers)
- **Categoría**: bug
- **Planificado en**: commit `8f78f50`, 2026-07-21

## Por qué importa

Dos operaciones de dinero usan el patrón leer-comprobar-escribir sin ningún
candado ni restricción en la base de datos.

La primera: una venta lee el stock de un producto, comprueba que alcance y escribe
el nuevo valor. Dos ventas simultáneas del mismo producto — dos terminales, o un
doble clic — leen el mismo stock, ambas pasan la comprobación y ambas escriben. La
segunda escritura pisa el descuento de la primera. El inventario queda por encima
de lo real, se puede vender lo que no existe y nunca se lanza un error.

La segunda: abrir caja consulta si ya hay una sesión ABIERTA hoy y, si no la hay,
crea una. Dos peticiones concurrentes pasan la comprobación antes de que cualquiera
haga commit, y quedan dos cajas abiertas el mismo día. Todo el código posterior
asume "como máximo una caja abierta por día" y toma la que devuelva
`findTopByFechaOrderByHoraAperturaDesc`, ocultando en silencio los movimientos
registrados en la otra y corrompiendo el cuadre del día.

Ninguna de las dos falla en pruebas manuales. Las dos corrompen datos en
producción bajo uso normal de dos personas.

## Estado actual

Archivos relevantes:

- `Backend/gym/src/main/java/gymOne/gym/entity/Producto.java` — sin campo
  `@Version`, sin bloqueo optimista.
- `Backend/gym/src/main/java/gymOne/gym/service/VentaService.java` — el
  leer-comprobar-escribir del stock, líneas 51–68.
- `Backend/gym/src/main/java/gymOne/gym/entity/CajaSesion.java` — sin restricción
  única sobre `fecha`.
- `Backend/gym/src/main/java/gymOne/gym/service/CajaService.java` — el
  comprobar-luego-actuar de `abrir`, líneas 39–54.
- `Backend/gym/src/main/java/gymOne/gym/exception/GlobalExceptionHandler.java` —
  el manejador global; revísalo antes del Paso 3.

`Producto.java:14-38`, tal como está hoy — nota que **no** hay `@Version`:

```java
@Entity
@Table(name = "productos")
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Categoria categoria;

    @Column(nullable = false)
    private BigDecimal costo;

    @Column(nullable = false)
    private BigDecimal precio;

    @Column(nullable = false)
    private Integer stock = 0;

    private String proveedor;
```

`VentaService.java:51-68` — la carrera del stock:

```java
        for (VentaItemRequest itemRequest : request.items()) {
            Producto producto = productoService.buscarOFallar(itemRequest.productoId());

            if (producto.getStock() < itemRequest.cantidad()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "Stock insuficiente para " + producto.getNombre() + " (disponible: " + producto.getStock() + ")");
            }

            producto.setStock(producto.getStock() - itemRequest.cantidad());
```

`CajaSesion.java:19-48` — nota que `@Table` no declara `uniqueConstraints`:

```java
@Entity
@Table(name = "caja_sesiones")
public class CajaSesion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate fecha = LocalDate.now();

    @Column(name = "hora_apertura", nullable = false)
    private LocalDateTime horaApertura = LocalDateTime.now();

    @Column(name = "hora_cierre")
    private LocalDateTime horaCierre;

    @Column(name = "saldo_inicial", nullable = false)
    private BigDecimal saldoInicial;

    @Column(name = "saldo_final")
    private BigDecimal saldoFinal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "responsable_id", nullable = false)
    private Usuario responsable;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoCaja estado = EstadoCaja.ABIERTA;
```

`CajaService.java:39-54` — el comprobar-luego-actuar de la apertura:

```java
    public CajaSesionResponse abrir(BigDecimal saldoInicial, String correoUsuario) {
        LocalDate hoy = LocalDate.now();

        if (cajaSesionRepository.findByFechaAndEstado(hoy, CajaSesion.EstadoCaja.ABIERTA).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una caja abierta para hoy");
        }

        Usuario responsable = usuarioRepository.findByCorreo(correoUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        CajaSesion sesion = new CajaSesion();
        sesion.setSaldoInicial(saldoInicial);
        sesion.setResponsable(responsable);

        return toResponse(cajaSesionRepository.save(sesion));
    }
```

Convenciones del repositorio:

- Los servicios llevan `@Service @Transactional` a nivel de clase.
- Los errores se señalan con
  `throw new ResponseStatusException(HttpStatus.X, "mensaje en español")`.
- El dinero es `BigDecimal` en todo el proyecto. Nunca lo conviertas a `double`.
- `spring.jpa.hibernate.ddl-auto=update` — Hibernate genera el esquema desde las
  entidades. **No hay archivos de migración**, así que un cambio de entidad es el
  único mecanismo de cambio de esquema disponible. Ver el Paso 3 sobre por qué eso
  importa aquí.

## Comandos que necesitarás

| Propósito | Comando | Desde | Esperado si va bien |
|---|---|---|---|
| Compilar | `.\mvnw.cmd -B clean compile` | `Backend/gym/` | código 0, `BUILD SUCCESS` |
| Pruebas | `.\mvnw.cmd -B test` | `Backend/gym/` | código 0, 0 fallos |
| Una clase | `.\mvnw.cmd -B test -Dtest=ConcurrenciaVentaTest` | `Backend/gym/` | código 0 |
| Levantar BD | `docker compose -f Backend/gym/compose.yaml up -d` | raíz del repo | contenedor `gymone-postgres` en marcha |

En una shell POSIX sustituye `.\mvnw.cmd` por `./mvnw`.

## Alcance

**Dentro del alcance**:

- `Backend/gym/src/main/java/gymOne/gym/entity/Producto.java` (modificar — añadir `@Version`)
- `Backend/gym/src/main/java/gymOne/gym/entity/CajaSesion.java` (modificar — añadir restricción única)
- `Backend/gym/src/main/java/gymOne/gym/service/VentaService.java` (modificar — traducir el conflicto a 409)
- `Backend/gym/src/main/java/gymOne/gym/service/CajaService.java` (modificar — capturar la violación de restricción)
- `Backend/gym/src/main/java/gymOne/gym/exception/GlobalExceptionHandler.java` (modificar, solo si el Paso 4 lo requiere)
- `Backend/gym/src/test/java/gymOne/gym/service/ConcurrenciaVentaTest.java` (crear)
- `Backend/gym/src/test/java/gymOne/gym/service/ConcurrenciaCajaTest.java` (crear)

**Fuera del alcance** (NO tocar, aunque parezcan relacionados):

- La lógica de precios, totales o descuentos de `VentaService.crear`. Este plan
  solo aborda la concurrencia; la aritmética ya es correcta.
- El descuento de stock en sí. La resta está bien; lo que falta es el candado.
- `ProductoService.buscarOFallar` — sigue siendo un `findById` normal. El bloqueo
  optimista del Paso 1 funciona sin cambiarlo, y añadir `@Lock` ahí afectaría a
  todos los que llaman, no solo a la venta.
- Cualquier archivo de `Frontend/`. El frontend ya muestra los mensajes de error
  del backend en la pantalla de Ventas
  (`Frontend/src/pages/Ventas/Ventas.jsx:92-93`), así que el 409 nuevo se ve solo.
- `plans/004`'s automatic caja movements. Si el plan 004 ya se aplicó, no toques su
  método `registrarMovimientoAutomatico`.

## Flujo de git

- Rama: `advisor/005-guardas-concurrencia`
- Un commit por paso. Mensajes en español o inglés; el repositorio no usa
  conventional commits.
- NO hagas push ni abras un PR salvo que el operador lo pida.

## Pasos

### Paso 1: Añadir bloqueo optimista a `Producto`

En `Backend/gym/src/main/java/gymOne/gym/entity/Producto.java`, añade un campo de
versión después de `proveedor`:

```java
    @Version
    private Long version;
```

Importa `jakarta.persistence.Version`. Añade también su getter y setter, siguiendo
el estilo del resto del archivo (todos los campos tienen ambos).

Con esto Hibernate incluye `WHERE version = ?` en cada UPDATE del producto e
incrementa la columna. Si otra transacción ya modificó la fila, el UPDATE afecta a
cero filas y Hibernate lanza `ObjectOptimisticLockingFailureException`. Esa es
exactamente la escritura perdida que hoy pasa desapercibida.

Como `ddl-auto=update`, Hibernate añade la columna `version` automáticamente al
arrancar. Las filas existentes quedan con `NULL`; Hibernate las trata como nuevas y
las versiona en el primer UPDATE, así que no hace falta backfill.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0. Luego arranca la
aplicación contra la base de datos de desarrollo y confirma en el log que
Hibernate añadió la columna, o compruébalo con
`docker exec gymone-postgres psql -U gymone -d gymone_db -c '\d productos'` → aparece
la columna `version`.

### Paso 2: Traducir el conflicto de stock a un 409 con mensaje en español

En `VentaService.crear`, envuelve la operación de modo que un
`ObjectOptimisticLockingFailureException` (de
`org.springframework.orm.ObjectOptimisticLockingFailureException`) se convierta en:

```java
throw new ResponseStatusException(HttpStatus.CONFLICT,
        "El stock cambió mientras se registraba la venta. Vuelve a intentarlo.");
```

Punto importante sobre el momento: con `@Transactional` a nivel de clase, la
excepción de bloqueo se lanza cuando Hibernate vuelca los cambios, que suele ser en
el commit — es decir, **después** de que `crear` retorne. Un `try/catch` dentro del
método puede no atraparla nunca.

Tienes dos opciones; elige una y aplícala de forma consistente:

- **Opción A (preferida)**: llama a `ventaRepository.saveAndFlush(venta)` en lugar
  de `save(venta)` para forzar el volcado dentro del método, y entonces sí
  envuelve con `try/catch`. Es un cambio de una línea más el catch.
- **Opción B**: deja que la excepción suba y manéjala en
  `GlobalExceptionHandler` con un `@ExceptionHandler(ObjectOptimisticLockingFailureException.class)`
  que devuelva 409. Más general, pero el mensaje no puede mencionar el producto.

Si eliges la Opción A y el plan 004 ya está aplicado, cuida que el
`registrarMovimientoAutomatico` quede **después** del flush exitoso, no antes.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0.

### Paso 3: Añadir la restricción única de caja al nivel de la base de datos

El chequeo en código no puede cerrar esta carrera; solo la base de datos puede.

En `CajaSesion.java`, cambia la anotación `@Table` para declarar una restricción
única sobre `fecha`:

```java
@Table(name = "caja_sesiones", uniqueConstraints = {
        @UniqueConstraint(name = "uk_caja_sesiones_fecha", columnNames = "fecha")
})
```

Importa `jakarta.persistence.UniqueConstraint`.

Esto impone **una sesión de caja por día**, no "una abierta por día". Es más
estricto que el invariante que el código comprueba hoy: significa que una caja
cerrada no se puede reabrir el mismo día. Es la regla correcta para este dominio
(el cuadre diario es único) y es la única variante expresable como restricción
única portable — una restricción parcial (`WHERE estado = 'ABIERTA'`) requeriría
SQL nativo y JPA no la modela.

**Aviso sobre datos existentes**: si la base de datos ya contiene dos filas de
`caja_sesiones` con la misma `fecha`, Hibernate **no podrá** crear el índice al
arrancar y lo registrará como advertencia (con `ddl-auto=update` no aborta el
arranque, así que la restricción quedaría silenciosamente ausente). Antes de dar
por bueno este paso, comprueba si hay duplicados:

```sql
SELECT fecha, COUNT(*) FROM caja_sesiones GROUP BY fecha HAVING COUNT(*) > 1;
```

Si devuelve filas, eso es una condición de PARADA — los duplicados hay que
consolidarlos a mano y esa es una decisión del operador, no tuya.

**Verificar**: arranca la aplicación y confirma con
`docker exec gymone-postgres psql -U gymone -d gymone_db -c '\d caja_sesiones'` → aparece
`uk_caja_sesiones_fecha` entre los índices.

### Paso 4: Convertir la violación de restricción en el 409 que ya existe

En `CajaService.abrir`, mantén el chequeo previo tal cual está (evita el error en
el caso normal, que es el 99% de las veces) y añade además el manejo de la
violación de restricción para el caso de carrera:

Captura `org.springframework.dao.DataIntegrityViolationException` alrededor del
`cajaSesionRepository.save(sesion)` y relánzala como:

```java
throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe una caja para hoy");
```

Igual que en el Paso 2, puede hacer falta `saveAndFlush` para que la violación
ocurra dentro del método en lugar de en el commit. Usa el mismo enfoque que
elegiste allí.

Revisa `GlobalExceptionHandler.java` antes de terminar: si ya tiene un manejador
para `DataIntegrityViolationException`, tu `try/catch` local debe ir por delante —
compruébalo, y si el manejador global ya devuelve un 409 con un mensaje razonable,
puedes omitir el catch local y decirlo en tu informe.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0.

### Paso 5: Probar ambas carreras de verdad

Estas pruebas necesitan PostgreSQL real y transacciones reales. Los mocks no
pueden reproducir una escritura perdida. Usa el patrón de Testcontainers de
`Backend/gym/src/test/java/gymOne/gym/GymApplicationTests.java` (creado por el plan
001): `@SpringBootTest`, `@ActiveProfiles("test")`, `@Testcontainers` y un
`@Container @ServiceConnection PostgreSQLContainer<?>` con la imagen `postgres:16`.

Crea `Backend/gym/src/test/java/gymOne/gym/service/ConcurrenciaVentaTest.java`:

1. `dosVentasConcurrentesNoSobrevendenElStock` — inserta un producto con stock 10.
   Lanza dos hilos con un `ExecutorService` de 2 hilos y un `CountDownLatch` para
   que arranquen a la vez, cada uno registrando una venta de 6 unidades. Afirma
   que exactamente una tuvo éxito y la otra falló, y que el stock final es 4 — no
   -2 y no 4 por casualidad tras dos éxitos. La aserción decisiva es
   `stockFinal == 4 && exitos == 1`.
2. `ventaUnicaDescuentaStockNormalmente` — control: una sola venta de 6 sobre 10
   deja 4 y no lanza nada. Sin esta prueba, la primera pasaría igual si rompieras
   las ventas por completo.

Crea `Backend/gym/src/test/java/gymOne/gym/service/ConcurrenciaCajaTest.java`:

3. `dosAperturasConcurrentesSoloCreanUnaSesion` — dos hilos llamando a `abrir` a la
   vez. Afirma que `caja_sesiones` contiene exactamente una fila para hoy y que
   exactamente una llamada falló.
4. `abrirDosVecesEnSecuenciaDevuelveConflict` — la segunda llamada lanza
   `ResponseStatusException` con estado `CONFLICT`. Verifica que el chequeo previo
   sigue funcionando y que no lo rompiste al añadir la restricción.

Notas para escribir estas pruebas:

- Cada hilo necesita su propia transacción. Llama al método del servicio desde el
  hilo (no marques el método de prueba como `@Transactional`, o los hilos
  compartirían contexto y la carrera no ocurriría).
- Recoge las excepciones de cada hilo en vez de dejar que se pierdan; cuenta
  éxitos y fallos explícitamente.
- Limpia las tablas entre pruebas para que el orden no importe.
- Si una prueba de concurrencia resulta intermitente, **no la marques como
  ignorada**. Un fallo intermitente aquí significa que el candado no está
  cerrando la ventana. Es una condición de PARADA.

**Verificar**: `.\mvnw.cmd -B test -Dtest='ConcurrenciaVentaTest,ConcurrenciaCajaTest'`
→ código 0, `Tests run: 4, Failures: 0, Errors: 0`. Ejecútalo **tres veces
seguidas** y confirma que las tres pasan; una sola ejecución verde no demuestra
nada en una prueba de concurrencia.

### Paso 6: Confirmar que no se rompió nada

**Verificar**: `.\mvnw.cmd -B clean test` desde `Backend/gym/` → código 0, 0
fallos, incluyendo todas las pruebas de los planes 001 y 004 si ya están.

## Plan de pruebas

| Archivo | Tipo | Necesita Docker | Casos |
|---|---|---|---|
| `service/ConcurrenciaVentaTest.java` | integración + Testcontainers | sí | 2 |
| `service/ConcurrenciaCajaTest.java` | integración + Testcontainers | sí | 2 |

Patrón estructural: `GymApplicationTests.java` del plan 001 para el arranque de
Testcontainers; `service/CajaServiceTest.java` para la disposición de paquetes y el
estilo de nombres.

Estas son deliberadamente pruebas de integración, no unitarias. El bloqueo
optimista y las restricciones únicas son comportamiento de la base de datos: un
mock siempre las daría por buenas.

## Criterios de finalización

Comprobables por máquina. TODOS deben cumplirse:

- [ ] `grep -c '@Version' Backend/gym/src/main/java/gymOne/gym/entity/Producto.java` devuelve 1
- [ ] `grep -c 'uniqueConstraints' Backend/gym/src/main/java/gymOne/gym/entity/CajaSesion.java` devuelve 1
- [ ] `.\mvnw.cmd -B clean test` (desde `Backend/gym/`) termina en 0 con 0 fallos
- [ ] `ConcurrenciaVentaTest` y `ConcurrenciaCajaTest` pasan **tres ejecuciones consecutivas**
- [ ] `\d productos` muestra la columna `version`; `\d caja_sesiones` muestra `uk_caja_sesiones_fecha`
- [ ] `git diff 8f78f50..HEAD -- Frontend/` está vacío
- [ ] `git diff --name-only 8f78f50..HEAD` solo lista archivos de la sección "Dentro del alcance"
- [ ] Fila de estado de 005 actualizada en `plans/README.md`

## Condiciones de PARADA

Detente e informa (no improvises) si:

- La consulta de duplicados del Paso 3 devuelve filas. Consolidar sesiones de caja
  duplicadas es una decisión de negocio del operador.
- Alguna prueba de concurrencia falla de forma intermitente. Eso significa que el
  candado no cierra la ventana, no que la prueba sea inestable. Nunca la marques
  como `@Disabled` ni le añadas reintentos.
- Docker no está disponible. Estas pruebas no tienen alternativa con mocks.
- Añadir `@Version` rompe alguna prueba o algún flujo existente, lo que
  indicaría que hay código que reutiliza instancias de `Producto` entre
  transacciones.
- La restricción única del Paso 3 resulta incompatible con cómo opera el gimnasio
  de verdad — por ejemplo, si hay dos turnos que abren caja por separado el mismo
  día. Eso invalidaría la premisa "una caja por día" y hay que decidirlo antes de
  imponerlo.
- Descubres que el descuento de stock ocurre en algún otro sitio además de
  `VentaService.crear`.

## Notas de mantenimiento

- El bloqueo optimista cambia el contrato de `Producto`: cualquier código futuro
  que actualice productos debe estar preparado para un 409. La pantalla de
  Inventario es la siguiente candidata a toparse con esto.
- La restricción `uk_caja_sesiones_fecha` impone una caja por día para siempre.
  Si algún día el negocio quiere cajas por turno o por sede, esa restricción es lo
  primero que hay que cambiar, y `CajaService` entero asume lo mismo.
- El mismo patrón leer-comprobar-escribir puede existir en otras partes que esta
  auditoría no cubrió — revisa `SuscripcionService` y `AsistenciaService` si
  aparecen síntomas de datos duplicados.
- Quien revise el PR debe fijarse en: que el `flush` ocurra dentro del método (si
  se eligió la Opción A del Paso 2), y que las pruebas de concurrencia realmente
  arranquen los hilos a la vez y no en secuencia — un `CountDownLatch` mal usado
  convierte la prueba en decorativa.
- Diferido a propósito: bloqueo pesimista (`SELECT ... FOR UPDATE`) sobre el
  producto. El optimista basta con este volumen y no serializa las ventas.
