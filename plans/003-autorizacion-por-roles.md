# Plan 003: Hacer valer en la API los tres roles que ya existen

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de PARADA", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (ejecútalo primero)**: `git diff --stat 8f78f50..HEAD -- Backend/gym/src/main/java/gymOne/gym/config Backend/gym/src/main/java/gymOne/gym/controller Frontend/src/routes Frontend/src/components/layout/Sidebar.jsx`
> Si algún archivo dentro del alcance cambió desde que se escribió este plan,
> compara los extractos de "Estado actual" contra el código vivo antes de
> continuar; ante cualquier diferencia, trátalo como condición de PARADA.

## Estado

- **Prioridad**: P1
- **Esfuerzo**: M
- **Riesgo**: MEDIO — una matriz demasiado restrictiva deja fuera de su trabajo diario al personal legítimo
- **Depende de**: `plans/001-base-de-verificacion.md` (la matriz de roles debe quedar cubierta por pruebas, y eso requiere una suite funcionando)
- **Categoría**: seguridad
- **Planificado en**: commit `8f78f50`, 2026-07-21

## Por qué importa

La aplicación define tres roles y los carga correctamente como autoridades de
Spring Security al iniciar sesión — y luego nunca los comprueba. Una búsqueda en
todo el backend de `@PreAuthorize`, `hasRole` o `hasAuthority` devuelve cero
coincidencias. La única regla de la cadena de filtros es
`.anyRequest().authenticated()`. En la práctica esto significa que una cuenta de
recepción puede reescribir la configuración del gimnasio, cerrar y cuadrar la caja,
crear y borrar gastos, y eliminar cualquier cliente, entrenador, plan de membresía o
producto — exactamente igual que el dueño. El frontend ni siquiera lo oculta: la
barra lateral etiqueta el enlace de configuración como "ADMIN" pero lo muestra a
todos los roles. Con este plan, los roles que el modelo de datos ya lleva pasan a
significar algo, y la frontera queda cubierta por pruebas para que siga así.

## Estado actual

Archivos relevantes:

- `Backend/gym/src/main/java/gymOne/gym/config/SecurityConfig.java` — la cadena de
  filtros. La seguridad a nivel de método **no** está activada.
- `Backend/gym/src/main/java/gymOne/gym/entity/Usuario.java:84-88` — el enum de roles.
- `Backend/gym/src/main/java/gymOne/gym/security/CustomUserDetailsService.java:29-35` —
  ya mapea el rol a una autoridad con prefijo `ROLE_`. Aquí no hay nada que cambiar.
- Los 18 archivos de `Backend/gym/src/main/java/gymOne/gym/controller/` — ninguno
  lleva hoy anotación de autorización.
- `Frontend/src/routes/PrivateRoute.jsx` — solo comprueba autenticación.
- `Frontend/src/components/layout/Sidebar.jsx` — muestra todos los ítems a todos.

`Usuario.java:84-88`:

```java
    public enum Rol {
        ADMINISTRADOR,
        ENTRENADOR,
        RECEPCIONISTA
    }
```

`CustomUserDetailsService.java:29-35` — la autoridad ya es correcta:

```java
        return new User(
                usuario.getCorreo(),
                usuario.getContrasenaHash(),
                usuario.isActivo(),
                true, true, true,
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name())));
```

Como la autoridad es `ROLE_ADMINISTRADOR`, la expresión correcta es
`hasRole('ADMINISTRADOR')` — Spring añade el prefijo `ROLE_` por su cuenta. **No**
escribas `hasRole('ROLE_ADMINISTRADOR')`; eso buscaría `ROLE_ROLE_...`.

`SecurityConfig.java:50-70` tal como está hoy:

```java
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex.authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/registro-publico/**").permitAll()
                        .anyRequest().authenticated())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
```

`Frontend/src/routes/PrivateRoute.jsx` completo:

```jsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function PrivateRoute() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
```

El rol del usuario conectado ya está disponible en el cliente:
`AuthContext.jsx:18` guarda `{ nombre, correo, rol }` y `useAuth()` lo expone como
`user`. `user.rol` es la cadena `"ADMINISTRADOR"` / `"ENTRENADOR"` /
`"RECEPCIONISTA"`.

Convenciones del repositorio:

- Los controladores son delgados: delegan en un servicio y devuelven un `record`
  DTO. Mantén la autorización en la capa de controlador, no dentro de los servicios.
- Los textos de error están en español. La respuesta 403 de Spring tiene cuerpo
  vacío, así que no hace falta ningún mensaje.
- El paquete `dto/` contiene únicamente `record` de Java.

### La matriz de roles a implementar

Esta matriz se eligió pensando en un gimnasio pequeño: el administrador es dueño del
cuadre de dinero, la configuración y las operaciones destructivas; la recepción
lleva el mostrador y las transacciones del día a día; el entrenador ve clientes y es
dueño de las rutinas, nada más.

`ADMINISTRADOR` tiene acceso a **todo** — cada regla de abajo es aditiva sobre eso.

| Endpoint | Método | RECEPCIONISTA | ENTRENADOR |
|---|---|---|---|
| `/api/auth/login` | POST | público | público |
| `/api/registro-publico` | POST | público | público |
| `/api/usuarios/me` | GET | sí | sí |
| `/api/dashboard/**` | GET | sí | no |
| `/api/clientes` | GET | sí | sí |
| `/api/clientes/{id}` | GET | sí | sí |
| `/api/clientes` | POST | sí | no |
| `/api/clientes/{id}` | PUT | sí | no |
| `/api/clientes/{id}` | DELETE | **no** | no |
| `/api/asistencias` | GET | sí | sí |
| `/api/asistencias/entrada`, `/{id}/salida` | POST | sí | sí |
| `/api/rutinas/**` | todos | no | **sí** (incluye crear/editar/borrar) |
| `/api/planes-membresia` | GET | sí | sí |
| `/api/planes-membresia` | POST/PUT/DELETE | no | no |
| `/api/suscripciones` | GET | sí | sí |
| `/api/suscripciones` | POST | sí | no |
| `/api/suscripciones/{id}/congelar`, `/renovar` | POST | sí | no |
| `/api/pagos` | GET | sí | no |
| `/api/pagos` | POST | sí | no |
| `/api/pagos/{id}/notificar` | POST | sí | no |
| `/api/ventas` | GET, POST | sí | no |
| `/api/productos` | GET | sí | sí |
| `/api/productos` | POST/PUT | sí | no |
| `/api/productos/{id}` | DELETE | **no** | no |
| `/api/caja/actual`, `/sesiones` | GET | sí | no |
| `/api/caja/abrir` | POST | sí | no |
| `/api/caja/{id}/movimientos` | POST | sí | no |
| `/api/caja/{id}/cerrar` | POST | **no** | no |
| `/api/gastos` | GET | sí | no |
| `/api/gastos` | POST/PUT/DELETE | **no** | no |
| `/api/entrenadores` | GET | sí | sí |
| `/api/entrenadores` | POST/PUT/DELETE | no | no |
| `/api/configuracion` | GET | sí | sí |
| `/api/configuracion` | PUT | **no** | no |
| `/api/notificaciones` | GET, `/{id}/leer` | sí | sí |
| `/api/notificaciones/evaluar` | POST | no | no |
| `/api/asistente/preguntar` | POST | sí | sí |

Justificación de las cuatro entradas en negrita, que son las que un revisor va a
cuestionar: cerrar la caja es el paso de cuadre cuyo resultado el dueño usa para
confiar en las cifras; los gastos y la configuración mueven directamente los libros;
y todo `DELETE` es irreversible en un sistema que no tiene rastro de auditoría ni
borrado lógico.

## Comandos que necesitarás

| Propósito | Comando | Desde | Esperado si va bien |
|---|---|---|---|
| Compilar | `.\mvnw.cmd -B clean compile` | `Backend/gym/` | código 0, `BUILD SUCCESS` |
| Pruebas | `.\mvnw.cmd -B test` | `Backend/gym/` | código 0, 0 fallos |
| Una clase | `.\mvnw.cmd -B test -Dtest=AutorizacionRolesTest` | `Backend/gym/` | código 0 |
| Lint frontend | `npm run lint` | `Frontend/` | código 0 |
| Build frontend | `npm run build` | `Frontend/` | código 0 |

En una shell POSIX sustituye `.\mvnw.cmd` por `./mvnw`.

## Alcance

**Dentro del alcance**:

- `Backend/gym/src/main/java/gymOne/gym/config/SecurityConfig.java` (modificar)
- Cada controlador de `Backend/gym/src/main/java/gymOne/gym/controller/` que la
  matriz restringe (modificar — solo anotaciones)
- `Backend/gym/src/test/java/gymOne/gym/controller/AutorizacionRolesTest.java` (crear)
- `Frontend/src/routes/PrivateRoute.jsx` (modificar)
- `Frontend/src/routes/AppRoutes.jsx` (modificar — pasar los roles permitidos por ruta)
- `Frontend/src/components/layout/Sidebar.jsx` (modificar — filtrar el menú por rol)

**Fuera del alcance** (NO tocar, aunque parezcan relacionados):

- `Backend/gym/src/main/java/gymOne/gym/security/CustomUserDetailsService.java` —
  ya emite la autoridad correcta con prefijo `ROLE_`. Cambiarlo rompe todas las
  expresiones `hasRole` que vas a añadir.
- `Backend/gym/src/main/java/gymOne/gym/entity/Usuario.java` — no añadas, renombres
  ni reordenes roles. La matriz usa exactamente los tres que existen.
- Cualquier clase de `service/` — en este código la autorización va en la frontera
  del controlador. No dispersa comprobaciones dentro de los servicios.
- Las reglas `permitAll` de `/api/auth/**` y `/api/registro-publico/**` — son
  intencionadas y deben seguir funcionando.
- Comprobaciones de propiedad o de pertenencia (por ejemplo "un entrenador solo
  puede editar rutinas de sus propios clientes"). Es un asunto distinto y mayor;
  este plan es solo a nivel de rol.
- Endpoints de gestión de usuarios — `UsuarioController` hoy solo expone
  `GET /api/usuarios/me`. No añadas aquí endpoints de crear/listar/borrar usuarios.

## Flujo de git

- Rama: `advisor/003-autorizacion-roles`
- Un commit por paso. Mensajes en español o inglés; el repositorio no usa
  conventional commits.
- NO hagas push ni abras un PR salvo que el operador lo pida.

## Pasos

### Paso 1: Activar la seguridad a nivel de método

En `Backend/gym/src/main/java/gymOne/gym/config/SecurityConfig.java`, añade la
anotación `@EnableMethodSecurity` a la clase, junto a `@Configuration` y
`@EnableWebSecurity`. Impórtala desde
`org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity`.

No cambies nada más en este archivo todavía. En particular deja
`.anyRequest().authenticated()` exactamente como está — se queda como red de
seguridad, y las anotaciones por método se superponen encima.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0. Luego
`grep -n 'EnableMethodSecurity' Backend/gym/src/main/java/gymOne/gym/config/SecurityConfig.java`
→ dos coincidencias (el import y la anotación).

### Paso 2: Anotar los endpoints exclusivos del administrador

Añade `@PreAuthorize("hasRole('ADMINISTRADOR')")` exactamente a estos métodos de
controlador. Importa `org.springframework.security.access.prepost.PreAuthorize` en
cada archivo que toques.

| Archivo | Métodos a anotar |
|---|---|
| `ConfiguracionController.java` | `actualizar` (el `@PutMapping`) — **no** `obtener` |
| `CajaController.java` | solo `cerrar` (`@PostMapping("/{id}/cerrar")`) |
| `GastoController.java` | `crear`, `actualizar`, `eliminar` — **no** `listar` |
| `ClienteController.java` | solo `eliminar` |
| `ProductoController.java` | solo `eliminar` |
| `EntrenadorController.java` | `crear`, `actualizar`, `eliminar` — **no** `listar` |
| `PlanMembresiaController.java` | `crear`, `actualizar`, `eliminar` — **no** `listar` ni `obtener` |
| `NotificacionController.java` | solo `evaluar` (`@PostMapping("/evaluar")`) |

Cuando un controlador entero fuera exclusivo del administrador podrías anotar la
clase en vez de cada método — pero ninguno de los de arriba lo es, así que anota
método por método.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0. Luego
`grep -rc "PreAuthorize" Backend/gym/src/main/java/gymOne/gym/controller/ | grep -v ':0'`
→ lista exactamente los 8 archivos de la tabla.

### Paso 3: Anotar los endpoints que el entrenador no debe alcanzar

La restricción restante son las operaciones de dinero y de membresías que un
`RECEPCIONISTA` sí puede hacer y un `ENTRENADOR` no. Exprésalas como
`@PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA')")`.

Aplícala a nivel de **clase** en:

- `PagoController.java`
- `VentaController.java`
- `GastoController.java` — la regla de clase cubre `listar`; la de método del Paso 2
  es más restrictiva y gana correctamente en esos tres métodos
- `DashboardController.java`

Aplícala a nivel de **método** en:

- `CajaController.java` — en `actual`, `historial`, `abrir`, `registrarMovimiento`
  (`cerrar` ya tiene la regla más estricta del Paso 2). Como todos los métodos
  quedan cubiertos, también puedes poner el `hasAnyRole` en la clase y dejar la
  anotación de solo-admin en `cerrar`; ambas opciones valen, elige una y sé
  consistente.
- `ClienteController.java` — en `crear` y `actualizar`
- `ProductoController.java` — en `crear` y `actualizar`
- `SuscripcionController.java` — en `crear`, `congelar`, `renovar` (no en `listar`)

Todo lo que no se nombre en el Paso 2 o el Paso 3 se queda simplemente autenticado,
según la matriz. No anotes `AuthController`, `RegistroPublicoController`,
`UsuarioController`, `AsistenciaController`, `RutinaController` ni
`AsistenteController`.

**Verificar**: `.\mvnw.cmd -B clean compile` → código 0.

### Paso 4: Escribir la prueba de la matriz de roles

Crea `Backend/gym/src/test/java/gymOne/gym/controller/AutorizacionRolesTest.java`.

Usa pruebas de rebanada `@WebMvcTest` con `MockMvc`, y `@WithMockUser(roles = "...")`
de `spring-boot-starter-security-test` (ya es dependencia en `pom.xml`) para simular
cada rol. Ten en cuenta que `@WithMockUser(roles = "RECEPCIONISTA")` produce la
autoridad `ROLE_RECEPCIONISTA` — pasa el nombre del rol **sin** el prefijo, igual
que funciona `hasRole`.

Como son rebanadas, mockea el servicio del que depende cada controlador con
`@MockitoBean` (el reemplazo en Spring Boot 3.4+ / 4.x del obsoleto `@MockBean`).
También tendrás que proveer los beans de seguridad que la rebanada no carga: si el
contexto no arranca porque falta `JwtAuthFilter` o `CustomUserDetailsService`,
añádelos también como `@MockitoBean` en lugar de importar el contexto completo.

Escribe como mínimo estos diez casos, cada uno afirmando un estado HTTP:

| Prueba | Petición | Como rol | Se espera |
|---|---|---|---|
| 1 | `PUT /api/configuracion` | RECEPCIONISTA | 403 |
| 2 | `PUT /api/configuracion` | ADMINISTRADOR | 200 |
| 3 | `GET /api/configuracion` | RECEPCIONISTA | 200 |
| 4 | `POST /api/caja/1/cerrar` | RECEPCIONISTA | 403 |
| 5 | `POST /api/caja/abrir` | RECEPCIONISTA | 201 |
| 6 | `POST /api/gastos` | RECEPCIONISTA | 403 |
| 7 | `GET /api/gastos` | RECEPCIONISTA | 200 |
| 8 | `DELETE /api/clientes/1` | RECEPCIONISTA | 403 |
| 9 | `POST /api/ventas` | ENTRENADOR | 403 |
| 10 | `GET /api/clientes` | ENTRENADOR | 200 |

Los casos 3 y 7 son los importantes: demuestran que la restricción es por método y
que no bloqueaste un controlador entero sin querer.

Para los casos POST/PUT que esperan éxito, envía un cuerpo JSON válido acorde al
`record` de petición correspondiente (por ejemplo `CajaAperturaRequest` para
`POST /api/caja/abrir`), de forma que la petición falle por autorización o tenga
éxito por el servicio mockeado, nunca por validación de bean. Si un caso devuelve
400 en lugar del estado esperado, el cuerpo está mal — corrige el cuerpo, no la
aserción.

**Verificar**: `.\mvnw.cmd -B test -Dtest=AutorizacionRolesTest` → código 0,
`Tests run: 10, Failures: 0, Errors: 0`.

### Paso 5: Reflejar la matriz en el enrutador del frontend

Cambia `Frontend/src/routes/PrivateRoute.jsx` para que acepte una prop opcional
`allowedRoles` (array):

- Si no está autenticado → `<Navigate to="/login" replace />` (sin cambios).
- Si `allowedRoles` viene definido y `user?.rol` no está en él → redirige a `/`
  (el dashboard) con `replace`. No muestres una página de error; una redirección
  silenciosa encaja con la navegación actual de la aplicación.
- En caso contrario → `<Outlet />`.

Lee `user` desde `useAuth()` — ya está expuesto
(`Frontend/src/context/AuthContext.jsx:37`) y `user.rol` contiene la cadena del rol.

Después, en `Frontend/src/routes/AppRoutes.jsx`, envuelve las rutas restringidas
para que lleven los `allowedRoles` correctos. Según la matriz, las restricciones del
lado cliente son:

- `/configuracion` → `['ADMINISTRADOR']`
- `/gastos` → `['ADMINISTRADOR']`
- `/caja`, `/pagos`, `/ventas`, `/reportes` → `['ADMINISTRADOR', 'RECEPCIONISTA']`
- todo lo demás → sin restricción para cualquier usuario autenticado

Mantén cada `React.lazy` existente exactamente como está — la carga diferida de
`AppRoutes.jsx:9-22` es correcta y no debe deshacerse.

Esto es defensa en profundidad y mejora de experiencia, **no** un control de
seguridad. Las reglas del servidor de los pasos 2–3 son la frontera real; esto solo
evita que el personal entre a una pantalla que les va a devolver 403.

**Verificar**: `npm run lint` → código 0, y `npm run build` → código 0, ambos desde
`Frontend/`.

### Paso 6: Filtrar la barra lateral por rol

En `Frontend/src/components/layout/Sidebar.jsx`, da a cada ítem de navegación un
array opcional `roles` y filtra la lista renderizada contra `user?.rol` de
`useAuth()`. Usa los mismos conjuntos de roles del Paso 5.

Quita la etiqueta "ADMIN" fijada en el enlace de configuración, que ahora es
redundante — el ítem simplemente no se renderiza para quien no sea administrador. Si
esa etiqueta está implementada con un `Badge`, quita ese uso pero deja el componente
`Badge` intacto; se usa en otros sitios.

**Verificar**: `npm run lint` → código 0, `npm run build` → código 0.

### Paso 7: Prueba manual de la frontera

Con el backend corriendo y el servidor de desarrollo del frontend levantado:

1. Inicia sesión como el `ADMINISTRADOR` sembrado. Confirma que la barra lateral
   muestra Configuración, Gastos, Caja, Pagos, Ventas y Reportes, y que la pantalla
   de Configuración guarda correctamente.
2. Crea un usuario `RECEPCIONISTA`. No hay endpoint de gestión de usuarios, así que
   inserta la fila directamente en la tabla `usuarios` con un hash bcrypt — o cambia
   temporalmente la columna `rol` del usuario sembrado y reinicia. Inicia sesión con
   esa cuenta.
3. Confirma que Configuración y Gastos no aparecen en la barra lateral, que navegar
   directamente a `/configuracion` redirige al dashboard, y que Caja se muestra pero
   "Cerrar caja" devuelve 403 desde la API.
4. Restaura cualquier fila que hayas alterado en el punto 2.

**Verificar**: se cumplen las cuatro observaciones. Registra el resultado en tu
informe.

## Plan de pruebas

- Archivo nuevo
  `Backend/gym/src/test/java/gymOne/gym/controller/AutorizacionRolesTest.java` con
  los 10 casos del Paso 4: tres positivos (el rol permitido pasa), seis negativos
  (403) y uno que demuestra que una lectura siguió abierta en un controlador cuya
  escritura sí está restringida.
- Patrón estructural: si `plans/001-base-de-verificacion.md` ya se aplicó, imita la
  disposición y el estilo de nombres de
  `Backend/gym/src/test/java/gymOne/gym/service/CajaServiceTest.java`. Estas son
  rebanadas `@WebMvcTest` y no pruebas unitarias puras, así que las anotaciones
  difieren, pero mantén la estructura de paquetes espejo de `src/main`.
- Frontend: no hay framework de pruebas instalado, así que el cambio del enrutador
  queda cubierto por la prueba manual del Paso 7. No instales un framework de
  pruebas como parte de este plan.
- Verificación: `.\mvnw.cmd -B test` → todo pasa, incluidas las 10 pruebas nuevas.

## Criterios de finalización

Comprobables por máquina. TODOS deben cumplirse:

- [ ] `grep -c 'EnableMethodSecurity' Backend/gym/src/main/java/gymOne/gym/config/SecurityConfig.java` ≥ 1
- [ ] `grep -rl 'PreAuthorize' Backend/gym/src/main/java/gymOne/gym/controller/ | wc -l` devuelve 12 o más
- [ ] `grep -rn "hasRole('ROLE_" Backend/gym/src/main/java/` no devuelve coincidencias (el error del prefijo doble)
- [ ] `.\mvnw.cmd -B clean test` (desde `Backend/gym/`) termina en 0 con 0 fallos; `AutorizacionRolesTest` ejecuta 10 pruebas
- [ ] `npm run lint` y `npm run build` (desde `Frontend/`) terminan en 0
- [ ] `grep -rn 'allowedRoles' Frontend/src/routes/` devuelve coincidencias tanto en `PrivateRoute.jsx` como en `AppRoutes.jsx`
- [ ] `git diff --name-only 8f78f50..HEAD` solo lista archivos de la sección "Dentro del alcance"
- [ ] La prueba manual del Paso 7 se realizó y se informaron sus cuatro observaciones
- [ ] Fila de estado de 003 actualizada en `plans/README.md`

## Condiciones de PARADA

Detente e informa (no improvises) si:

- La matriz choca con cómo opera el gimnasio de verdad — por ejemplo, si resulta que
  quien cierra la caja al final del turno es normalmente recepción. La matriz es un
  valor por defecto razonado, no un requisito descubierto; una discrepancia es
  decisión del operador, no algo que ajustar en silencio.
- Las rebanadas `@WebMvcTest` no arrancan porque la configuración de seguridad
  arrastra el contexto completo de la aplicación. Informa de qué falta en vez de
  convertir las pruebas a `@SpringBootTest` — eso las haría lentas y dependientes de
  Docker.
- Descubres un endpoint que no aparece en la matriz (alguien añadió un controlador
  después de escribirse este plan). Infórmalo; no adivines su requisito de rol.
- Añadir `@EnableMethodSecurity` rompe algún comportamiento existente de una forma
  que la matriz no explica.
- Te ves necesitando cambiar `CustomUserDetailsService.java`, `Usuario.java` o
  alguna clase de `service/`. Los tres están fuera del alcance, y necesitarlos
  significa que la suposición "las autoridades ya se pueblan correctamente" es
  falsa.

## Notas de mantenimiento

- **Cada método de controlador nuevo necesita una decisión de matriz.** El valor por
  defecto (`.anyRequest().authenticated()`) es permisivo, así que olvidar una
  anotación concede acceso silenciosamente a los tres roles. Considera esto lo
  principal que debe revisar quien apruebe un PR que añada un endpoint.
- La matriz vive ahora en dos sitios — las anotaciones `@PreAuthorize` y la
  configuración de rutas y menú del frontend. Van a divergir. El backend es la
  autoridad; el frontend es cosmético. Si difieren, se arregla el frontend.
- `AutorizacionRolesTest` es la red de regresión. Añade un caso cada vez que cambie
  la matriz.
- Quien revise el PR debe fijarse en: que los endpoints de lectura
  (`GET /api/configuracion`, `GET /api/gastos`) hayan quedado abiertos donde la
  matriz dice, ya que pasarse de restrictivo es aquí el fallo más probable.
- Diferido a propósito: **comprobaciones de propiedad**. Hoy un entrenador puede
  editar la rutina de cualquier cliente, no solo de los suyos; recepción puede ver
  el historial de pagos de cualquier cliente. El acceso por rol es la primera capa
  correcta, pero las comprobaciones a nivel de objeto (IDOR) son un trabajo aparte y
  ningún plan las cubre todavía.
- También diferido: la gestión de usuarios. Hoy no hay forma de crear un segundo
  usuario desde la API, que es por lo que el Paso 7 exige un `INSERT` manual. Esa
  carencia merece su propio plan.
