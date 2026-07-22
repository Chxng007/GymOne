# Plan 004: Hacer que ventas, pagos y gastos registren movimiento en caja

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de PARADA", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (ejecútalo primero)**: `git diff --stat 8f78f50..HEAD -- Backend/gym/src/main/java/gymOne/gym/service Backend/gym/src/main/java/gymOne/gym/entity/CajaMovimiento.java`
> Si algún archivo dentro del alcance cambió desde que se escribió este plan,
> compara los extractos de "Estado actual" contra el código vivo antes de
> continuar; ante cualquier diferencia, trátalo como condición de PARADA.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: M
- **Riesgo**: MEDIO — cambia lo que reporta el cuadre diario, que es una cifra que el dueño ya lee
- **Depende de**: `plans/001-base-de-verificacion.md` (la corrección de este plan descansa por completo en sus pruebas)
- **Categoría**: bug
- **Planificado en**: commit `8f78f50`, 2026-07-21

## Por qué importa

La caja y el dinero que se supone que registra son dos sistemas desconectados.
Registrar una venta descuenta stock y guarda una `Venta`, pero no escribe nada en la
sesión de caja abierta. Registrar un pago guarda un `Pago` y no escribe nada.
Registrar un gasto guarda un `Gasto` y no escribe nada. Lo único que llega alguna vez
a `caja_movimientos` son los movimientos que alguien teclea a mano desde la pantalla
de Caja. Así que el `saldoFinal` al cierre del día — el número que el dueño cuadra
contra el efectivo físico — refleja solo lo que alguien se acordó de volver a
introducir, y diverge del historial de ventas y pagos por construcción.

El modelo de datos estaba claramente pensado para que esto funcionara:
`CajaMovimiento` ya tiene una clave foránea `referenciaPago` hacia `Pago`. No se
asigna en ningún sitio del código. Este plan conecta los tres flujos de dinero con la
caja y hace que la cifra de cuadre signifique lo que todo el mundo ya asume.

## Estado actual

Archivos relevantes:

- `Backend/gym/src/main/java/gymOne/gym/service/CajaService.java` — dueño del ciclo
  de vida de sesiones y movimientos. `@Transactional` a nivel de clase.
- `Backend/gym/src/main/java/gymOne/gym/service/VentaService.java` — `crear` en las
  líneas 40–74 guarda la venta y descuenta stock. Nunca toca caja.
- `Backend/gym/src/main/java/gymOne/gym/service/PagoService.java` — `crear` en las
  líneas 53–76 guarda el pago. Nunca toca caja.
- `Backend/gym/src/main/java/gymOne/gym/service/GastoService.java` — guarda gastos.
  Nunca toca caja.
- `Backend/gym/src/main/java/gymOne/gym/entity/CajaMovimiento.java` — la entidad de
  movimiento, que ya lleva el enlace `referenciaPago` sin usar.

Confirmado por grep: fuera del propio `CajaService.java`, las únicas referencias a
`CajaService` en todo el backend están en `CajaController` y `DashboardService`.
Ningún servicio registra un movimiento.

`CajaMovimiento.java:20-46` — fíjate en `referenciaPago`, presente y sin usar:

```java
@Entity
@Table(name = "caja_movimientos")
public class CajaMovimiento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "caja_sesion_id", nullable = false)
    private CajaSesion cajaSesion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoMovimiento tipo;

    @Column(nullable = false)
    private String concepto;

    @Column(nullable = false)
    private BigDecimal monto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referencia_pago_id")
    private Pago referenciaPago;

    @Column(nullable = false)
    private LocalDateTime fecha = LocalDateTime.now();
```

`TipoMovimiento` tiene exactamente dos valores, `INGRESO` y `EGRESO` — ver el enum al
final de `CajaMovimiento.java` y su uso en `CajaService.java:96-97` y `:111-116`.

`CajaService.java:72-86`, el camino manual existente:

```java
    public CajaMovimientoResponse registrarMovimiento(Long sesionId, CajaMovimientoRequest request) {
        CajaSesion sesion = buscarSesionOFallar(sesionId);

        if (sesion.getEstado() == CajaSesion.EstadoCaja.CERRADA) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "La caja ya está cerrada");
        }

        CajaMovimiento movimiento = new CajaMovimiento();
        movimiento.setCajaSesion(sesion);
        movimiento.setTipo(CajaMovimiento.TipoMovimiento.valueOf(request.tipo()));
        movimiento.setConcepto(request.concepto());
        movimiento.setMonto(request.monto());

        return toResponse(cajaMovimientoRepository.save(movimiento));
    }
```

`CajaService.java:66-70` — la búsqueda de "sesión actual o null" sobre la que vas a
construir:

```java
    public CajaSesionResponse obtenerActualOSiNulo() {
        return cajaSesionRepository.findTopByFechaOrderByHoraAperturaDesc(LocalDate.now())
                .map(this::toResponse)
                .orElse(null);
    }
```

Ojo: esto devuelve la sesión más reciente de hoy **sin importar su estado** — puede
devolver una sesión `CERRADA`. Tu método nuevo debe filtrar por `ABIERTA`.

`VentaService.java:22-34` — la declaración de clase y el constructor que vas a
extender:

```java
@Service
@Transactional
public class VentaService {

    private final VentaRepository ventaRepository;
    private final ProductoService productoService;
    private final UsuarioRepository usuarioRepository;

    public VentaService(VentaRepository ventaRepository, ProductoService productoService, UsuarioRepository usuarioRepository) {
        this.ventaRepository = ventaRepository;
        this.productoService = productoService;
        this.usuarioRepository = usuarioRepository;
    }
```

`VentaService.java:70-74` — el final de `crear`, donde se calcula el total y se
guarda la venta:

```java
        venta.setTotal(subtotalGeneral.subtract(venta.getDescuento()));

        return toResponse(ventaRepository.save(venta));
    }
```

`PagoService.java:66-76` — el final de `crear`:

```java
        Pago pago = new Pago();
        pago.setCliente(cliente);
        pago.setSuscripcion(suscripcion);
        pago.setTipo(Pago.TipoPago.valueOf(request.tipo()));
        pago.setMetodo(Pago.MetodoPago.valueOf(request.metodo()));
        pago.setMonto(request.monto());
        pago.setNota(request.nota());
        pago.setRegistradoPor(registradoPor);

        return toResponse(pagoRepository.save(pago));
    }
```

Convenciones del repositorio:

- Los servicios llevan `@Service @Transactional` a nivel de clase, reciben
  repositorios por constructor y pueden depender de otros servicios (`VentaService`
  ya depende de `ProductoService`; `DashboardService` ya depende de `CajaService`).
- Los fallos usan `throw new ResponseStatusException(HttpStatus.X, "mensaje en español")`.
- El dinero es `BigDecimal` en todo el proyecto. Nunca lo conviertas a `double`.
- `Pago.MetodoPago` y `Venta.MetodoPago` son enums **distintos** en entidades
  distintas. Lee los valores reales de cada uno en
  `Backend/gym/src/main/java/gymOne/gym/entity/Pago.java` y `.../entity/Venta.java`
  antes de escribir el Paso 2 — no supongas los nombres.

### La decisión de diseño que implementa este plan

**Solo los movimientos en efectivo llegan a la caja.** Un pago con tarjeta o
transferencia nunca entra al cajón físico, así que contarlo en el `saldoFinal`
empeoraría el cuadre en lugar de mejorarlo. La regla es:

- Venta con método de pago en efectivo → `INGRESO` por el total de la venta.
- Pago con método en efectivo → `INGRESO` por el monto, con `referenciaPago`
  apuntando al pago.
- Gasto → `EGRESO` por el monto. (Se asume que los gastos se pagan en efectivo; ver
  las condiciones de PARADA si `Gasto` resulta tener un campo de método de pago.)
- Venta o pago no en efectivo → ningún movimiento, ningún error.

**Que no haya caja abierta no bloquea la transacción.** Si no hay sesión abierta, la
venta o el pago se registra igualmente y simplemente no genera movimiento. Bloquear
una venta porque nadie abrió la caja sería peor para el negocio que una caja
incompleta. Regístralo con nivel WARN para que el hueco sea visible.

## Comandos que necesitarás

| Propósito | Comando | Desde | Esperado si va bien |
|---|---|---|---|
| Compilar | `.\mvnw.cmd -B clean compile` | `Backend/gym/` | código 0, `BUILD SUCCESS` |
| Pruebas | `.\mvnw.cmd -B test` | `Backend/gym/` | código 0, 0 fallos |
| Una clase | `.\mvnw.cmd -B test -Dtest=VentaServiceTest` | `Backend/gym/` | código 0 |

En una shell POSIX sustituye `.\mvnw.cmd` por `./mvnw`.

## Alcance

**Dentro del alcance**:

- `Backend/gym/src/main/java/gymOne/gym/service/CajaService.java` (modificar — añadir un método interno de registro)
- `Backend/gym/src/main/java/gymOne/gym/service/VentaService.java` (modificar)
- `Backend/gym/src/main/java/gymOne/gym/service/PagoService.java` (modificar)
- `Backend/gym/src/main/java/gymOne/gym/service/GastoService.java` (modificar)
- `Backend/gym/src/test/java/gymOne/gym/service/VentaServiceTest.java` (crear)
- `Backend/gym/src/test/java/gymOne/gym/service/PagoServiceTest.java` (crear)
- `Backend/gym/src/test/java/gymOne/gym/service/CajaServiceTest.java` (modificar — añadir casos)

**Fuera del alcance** (NO tocar, aunque parezcan relacionados):

- `Backend/gym/src/main/java/gymOne/gym/entity/CajaMovimiento.java` — todos los
  campos que necesitas ya existen, incluido `referenciaPago`. Añadir una columna
  `referenciaVenta` o `referenciaGasto` es un cambio de esquema que este plan evita a
  propósito; usa el texto de `concepto` para identificar el origen.
- Cualquier controlador. El comportamiento nuevo es un efecto de la capa de
  servicio; no cambia ningún endpoint ni ninguna forma de respuesta.
- Cualquier archivo de `Frontend/`. La pantalla de Caja ya lista los movimientos que
  existan, así que mostrará los automáticos nuevos sin cambio alguno.
- Rellenar retroactivamente movimientos de ventas y pagos ya registrados. El
  historial se queda como está; el arreglo es hacia adelante.
- `CajaService.cerrar` y su aritmética de saldo — el cálculo ya es correcto,
  simplemente se le estaba alimentando un conjunto incompleto de movimientos.
- `spring.jpa.hibernate.ddl-auto` y cualquier asunto de esquema o migración — este
  plan no añade columnas.

## Flujo de git

- Rama: `advisor/004-caja-flujo-dinero`
- Un commit por paso. Mensajes en español o inglés; el repositorio no usa
  conventional commits.
- NO hagas push ni abras un PR salvo que el operador lo pida.

## Pasos

### Paso 1: Añadir un método interno de registro a `CajaService`

Añade a `CajaService` un método público que otros servicios llamen para registrar un
movimiento automático. **No** debe exponerse a través de `CajaController`.

Comportamiento requerido:

```
registrarMovimientoAutomatico(TipoMovimiento tipo, String concepto, BigDecimal monto, Pago referenciaPago)
```

1. Busca la sesión de hoy con estado `ABIERTA`. Añade un método de repositorio si no
   existe — `CajaSesionRepository` ya tiene
   `findByFechaAndEstado(LocalDate, EstadoCaja)`, usado en `CajaService.java:42`;
   reutilízalo en lugar de duplicarlo.
2. Si no hay sesión abierta: registra un WARN en español (por ejemplo
   `"No hay caja abierta; no se registró el movimiento automático: {}"` con el
   concepto) y retorna sin lanzar excepción. Usa el patrón SLF4J ya presente en este
   código — ver
   `Backend/gym/src/main/java/gymOne/gym/service/NotificacionService.java` para el
   idioma `private static final Logger log = LoggerFactory.getLogger(X.class);`.
3. En caso contrario construye un `CajaMovimiento` exactamente como hace
   `registrarMovimiento`, asigna `referenciaPago` cuando el argumento no sea nulo, y
   guárdalo.
4. Devuelve `void`. Quien llama no necesita el DTO de respuesta.

No modifiques el método existente `registrarMovimiento(Long, CajaMovimientoRequest)`
— el camino manual se queda exactamente como está.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0. Luego
`grep -n 'registrarMovimientoAutomatico' Backend/gym/src/main/java/gymOne/gym/service/CajaService.java`
→ una coincidencia.

### Paso 2: Registrar un INGRESO cuando se hace una venta en efectivo

Primero lee `Backend/gym/src/main/java/gymOne/gym/entity/Venta.java` y localiza los
valores reales de su enum `MetodoPago`. Identifica cuál significa efectivo — lo más
probable es `EFECTIVO`, pero confírmalo en el código en vez de suponerlo.

Después, en `VentaService`:

1. Añade `CajaService` como dependencia de constructor, junto a las tres existentes.
   `VentaService` ya depende de otro servicio (`ProductoService`), así que encaja con
   la forma establecida. Cuidado con la dependencia circular: `CajaService` no debe
   depender de `VentaService`. Hoy no lo hace — mantenlo así.
2. Al final de `crear`, después de que `ventaRepository.save(venta)` retorne,
   registra el movimiento cuando `venta.getMetodoPago()` sea el valor de efectivo:
   - tipo `INGRESO`
   - concepto: `"Venta #" + venta.getId()` (el id ya está poblado tras el save)
   - monto: `venta.getTotal()` — el total con descuento, no `subtotalGeneral`
   - referenciaPago: `null`

Guarda primero y registra después, para que el concepto pueda llevar el id real.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0.

### Paso 3: Registrar un INGRESO cuando se registra un pago en efectivo

Lee `Backend/gym/src/main/java/gymOne/gym/entity/Pago.java` y localiza el valor de
efectivo de su propio enum `MetodoPago`. Es un enum **distinto** del de `Venta`; no
reutilices el otro.

Después, en `PagoService`:

1. Añade `CajaService` como dependencia de constructor.
2. Al final de `crear`, después de `pagoRepository.save(pago)`, cuando el método sea
   efectivo, registra:
   - tipo `INGRESO`
   - concepto: `"Pago #" + pago.getId() + " - " + cliente.getPrimerNombre()`
   - monto: `pago.getMonto()`
   - referenciaPago: el `Pago` guardado — **este es el campo para el que se diseñó
     el esquema; asígnalo.**

No toques `notificarPago`. Su problema de enviar correo dentro de una transacción es
un hallazgo aparte y no entra en este alcance.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0. Luego
`grep -n 'setReferenciaPago\|referenciaPago' Backend/gym/src/main/java/gymOne/gym/service/`
→ al menos una coincidencia, en `CajaService.java`.

### Paso 4: Registrar un EGRESO cuando se registra un gasto

Lee primero `Backend/gym/src/main/java/gymOne/gym/service/GastoService.java` y
`.../entity/Gasto.java`.

- Si `Gasto` tiene un campo de método de pago, aplica la misma regla de solo-efectivo
  de los pasos 2–3.
- Si no lo tiene, trata todo gasto como efectivo y registra siempre.

En `GastoService.crear`, tras el save, registra: tipo `EGRESO`, concepto
`"Gasto #" + gasto.getId() + " - " + gasto.getConcepto()` (usa el nombre real del
campo de descripción — léelo en la entidad), monto el importe del gasto y
referenciaPago `null`.

**No** registres nada desde `GastoService.actualizar` ni `eliminar`. Editar o borrar
un gasto después haría falta un movimiento compensatorio, que es una cuestión de
diseño del flujo de correcciones que este plan no resuelve. Deja esos dos métodos sin
tocar.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0.

### Paso 5: Probar el comportamiento nuevo

Crea `Backend/gym/src/test/java/gymOne/gym/service/VentaServiceTest.java` y
`.../PagoServiceTest.java`. JUnit + Mockito puros, sin contexto de Spring — imítalos
de `Backend/gym/src/test/java/gymOne/gym/service/CajaServiceTest.java`, creado por
`plans/001-base-de-verificacion.md`.

Casos de `VentaServiceTest`:

1. `ventaEnEfectivoRegistraIngresoEnCaja` — mockea `CajaService`, crea una venta en
   efectivo, verifica que `registrarMovimientoAutomatico` se llamó una vez con tipo
   `INGRESO` y un monto igual al total de la venta. Usa un `ArgumentCaptor` y compara
   `BigDecimal` con `compareTo(...) == 0`, **no** con `equals` — la igualdad de
   `BigDecimal` es sensible a la escala.
2. `ventaConTarjetaNoRegistraMovimiento` — método distinto de efectivo; verifica que
   `registrarMovimientoAutomatico` nunca se llamó.
3. `elMontoDelIngresoUsaElTotalConDescuento` — venta con descuento; verifica que el
   monto capturado es igual a `total`, no al subtotal previo al descuento. Este es el
   caso que atrapa el error de implementación más probable.

Casos de `PagoServiceTest`:

4. `pagoEnEfectivoRegistraIngresoConReferencia` — verifica que la llamada ocurrió y
   que el `Pago` pasado como `referenciaPago` es el pago guardado.
5. `pagoConTransferenciaNoRegistraMovimiento` — verifica que no hubo llamada.

Añade a `CajaServiceTest`:

6. `movimientoAutomaticoSinCajaAbiertaNoLanzaExcepcion` — sin sesión abierta hoy;
   afirma que el método retorna con normalidad y que
   `cajaMovimientoRepository.save(...)` nunca se llamó. Es la garantía de continuidad
   del negocio de la decisión de diseño, así que debe quedar fijada por una prueba.
7. `movimientoAutomaticoConCajaAbiertaGuardaElMovimiento` — con sesión abierta;
   afirma que el save se llamó con el tipo, monto y sesión correctos.

**Verificar**: `.\mvnw.cmd -B test -Dtest='VentaServiceTest,PagoServiceTest,CajaServiceTest'`
→ código 0, todo pasa, al menos 7 pruebas nuevas entre ellas.

### Paso 6: Prueba de extremo a extremo

Con el backend corriendo y una base de datos disponible:

1. Abre la caja con un `saldoInicial` conocido (por ejemplo 100000).
2. Registra una venta en efectivo por un importe conocido.
3. Registra un pago en efectivo por un importe conocido.
4. Registra un gasto por un importe conocido.
5. Registra una venta con tarjeta.
6. `GET /api/caja/actual` — confirma que aparecen tres movimientos automáticos (dos
   INGRESO, un EGRESO), que la venta con tarjeta no generó ninguno, y que
   `saldoActual` es igual a `saldoInicial + venta + pago - gasto`.
7. Cierra la caja y confirma que `saldoFinal` coincide con esa misma aritmética.

**Verificar**: la aritmética de los puntos 6 y 7 cuadra exactamente. Informa de las
cifras que usaste y observaste.

## Plan de pruebas

Resumido arriba. Tras este plan la suite del backend contiene:

| Archivo | Tipo | Casos nuevos |
|---|---|---|
| `service/VentaServiceTest.java` | unitaria + Mockito | 3 |
| `service/PagoServiceTest.java` | unitaria + Mockito | 2 |
| `service/CajaServiceTest.java` | unitaria + Mockito | 2 añadidos a los 4 existentes |

Patrón estructural: `service/CajaServiceTest.java` del plan 001. Si el plan 001 no se
ha aplicado, DETENTE — no hay infraestructura de pruebas sobre la que construir y
toda la mitigación de riesgo de este plan son sus pruebas.

## Criterios de finalización

Comprobables por máquina. TODOS deben cumplirse:

- [ ] `.\mvnw.cmd -B clean test` (desde `Backend/gym/`) termina en 0 con 0 fallos
- [ ] `grep -c 'registrarMovimientoAutomatico' Backend/gym/src/main/java/gymOne/gym/service/CajaService.java` ≥ 1
- [ ] `grep -rln 'cajaService' Backend/gym/src/main/java/gymOne/gym/service/` lista `VentaService.java`, `PagoService.java`, `GastoService.java` y `DashboardService.java`
- [ ] `grep -rn 'setReferenciaPago' Backend/gym/src/main/java/` devuelve al menos una coincidencia fuera de la entidad
- [ ] `git diff 8f78f50..HEAD -- Backend/gym/src/main/java/gymOne/gym/controller/ Backend/gym/src/main/java/gymOne/gym/entity/ Frontend/` está vacío
- [ ] La aritmética de extremo a extremo del Paso 6 se verificó y las cifras se informaron
- [ ] Fila de estado de 004 actualizada en `plans/README.md`

## Condiciones de PARADA

Detente e informa (no improvises) si:

- `Venta` o `Pago` no tiene campo de método de pago, o su enum no tiene un valor
  claramente equivalente a efectivo. Toda la regla de solo-efectivo depende de poder
  distinguir efectivo de tarjeta; sin eso, informa y detente en vez de registrar
  todas las transacciones.
- Resulta que `Gasto` sí lleva método de pago y no está claro qué valores significan
  efectivo.
- Añadir `CajaService` a `VentaService` o `PagoService` crea una dependencia circular
  (Spring falla al arrancar con `BeanCurrentlyInCreationException`). Infórmalo — la
  solución sería una indirección por eventos de aplicación, que es un diseño distinto
  del que especifica este plan.
- Alguna prueba existente empieza a fallar. Eso significaría que algo dependía de que
  los movimientos de caja fueran solo manuales, lo que contradice la premisa de este
  plan.
- Encuentras que algún *otro* camino de código ya registra movimientos de caja y el
  grep de la auditoría lo pasó por alto.
- La aritmética del Paso 6 no cuadra. No ajustes `CajaService.cerrar` para que cuadre
  — ese método está fuera del alcance y su cálculo se verificó correcto.

## Notas de mantenimiento

- **Toda funcionalidad futura que mueva dinero debe registrar en caja.** Esto pasa a
  ser una regla permanente: devoluciones, anulaciones, cobros de suscripción,
  cualquier cosa en efectivo. El filtro de solo-efectivo es la parte que la gente
  olvidará.
- La cadena de `concepto` es el único enlace de vuelta al origen para ventas y
  gastos — solo los pagos tienen clave foránea real. Si algún día el cuadre necesita
  consultarse por origen, ese es el momento de añadir columnas `referenciaVenta` /
  `referenciaGasto`, y habrá que revisar el enfoque textual de este plan en lugar de
  extenderlo.
- Interacción con una futura función de anulación o devolución (ver los hallazgos de
  dirección): una venta anulada debe registrar un `EGRESO` compensatorio, no borrar
  el movimiento original, porque el `saldoFinal` de una caja cerrada ya está
  persistido.
- Quien revise el PR debe fijarse en: que se use el `total` con descuento y no el
  subtotal; que las transacciones no en efectivo no registren nada; y que la ausencia
  de sesión abierta no pueda hacer fallar una venta.
- Diferido a propósito: el relleno retroactivo de movimientos históricos y el
  registro desde `GastoService.actualizar`/`eliminar`.
