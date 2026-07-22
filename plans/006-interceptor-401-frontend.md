# Plan 006: Manejar el vencimiento de sesión en el frontend

> **Instrucciones para el ejecutor**: Sigue este plan paso a paso. Ejecuta cada
> comando de verificación y confirma el resultado esperado antes de pasar al
> siguiente paso. Si ocurre algo de la sección "Condiciones de PARADA", detente e
> informa — no improvises. Al terminar, actualiza la fila de estado de este plan
> en `plans/README.md`.
>
> **Chequeo de deriva (ejecútalo primero)**: `git diff --stat 8f78f50..HEAD -- Frontend/src/services/api.js Frontend/src/context/AuthContext.jsx Frontend/src/routes/PrivateRoute.jsx`
> Si algún archivo dentro del alcance cambió desde que se escribió este plan,
> compara los extractos de "Estado actual" contra el código vivo antes de
> continuar; ante cualquier diferencia, trátalo como condición de PARADA.

## Estado

- **Prioridad**: P2
- **Esfuerzo**: S
- **Riesgo**: BAJO
- **Depende de**: ninguno
- **Categoría**: bug
- **Planificado en**: commit `8f78f50`, 2026-07-21

## Por qué importa

El token JWT dura 24 horas. Cuando vence — o cuando se rota el secreto de firma,
que es exactamente lo que hace `plans/002` — el frontend no se entera. La instancia
de axios adjunta el token vencido a cada petición, el backend responde 401, y cada
pantalla muestra su propio "No se pudo cargar..." genérico. El usuario ve una
aplicación que parece rota: los datos no cargan en ninguna sección, nada explica por
qué, y el token muerto sigue en el almacenamiento hasta que a alguien se le ocurre
buscar el botón de cerrar sesión. Con este plan, un 401 cierra la sesión y lleva al
login, que es lo que el usuario necesita hacer.

## Estado actual

Archivos relevantes:

- `Frontend/src/services/api.js` — la instancia de axios que usan los 17 archivos
  de `Frontend/src/services/`. Solo tiene interceptor de petición.
- `Frontend/src/context/AuthContext.jsx` — dueño del estado de sesión y de las
  claves de almacenamiento.
- `Frontend/src/routes/PrivateRoute.jsx` — redirige al login cuando no hay token.

`Frontend/src/services/api.js` completo — nota que no hay
`interceptors.response`:

```js
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gymone_token') ?? sessionStorage.getItem('gymone_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
```

`Frontend/src/context/AuthContext.jsx:6-7` y `:27-34` — las claves y el `logout`
que ya existe:

```js
const TOKEN_KEY = 'gymone_token'
const USER_KEY = 'gymone_user'
```

```js
  function logout() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem(TOKEN_KEY)
    sessionStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }
```

Detalle clave que condiciona el diseño: el token se guarda en `localStorage` **o**
en `sessionStorage` según la casilla "recordarme" (`AuthContext.jsx:19`), y el
`logout` limpia ambos. El interceptor tiene que limpiar los dos igual.

Segundo detalle: el interceptor de respuesta vive fuera de React. No puede llamar a
`useAuth()` ni usar el enrutador de react-router. Por eso el Paso 1 usa
`window.location` y no `navigate`.

Convenciones del repositorio:

- Los servicios de `Frontend/src/services/` son funciones `async` que devuelven
  `data` de axios. Ver `Frontend/src/services/authService.js` como ejemplo.
- Los mensajes al usuario están en español.
- Los avisos se muestran con `showToast(mensaje, variante)` del `ToastContext`; las
  variantes en uso son `'success'` y `'danger'` — ver
  `Frontend/src/pages/Caja/Caja.jsx:55-56`.
- El linter es oxlint (`npm run lint`); no hay Prettier ni framework de pruebas.

## Comandos que necesitarás

Todos desde `Frontend/`.

| Propósito | Comando | Esperado si va bien |
|---|---|---|
| Instalar | `npm ci` | código 0 |
| Lint | `npm run lint` | código 0 |
| Build | `npm run build` | código 0 |
| Dev | `npm run dev` | sirve en `http://localhost:5173` |

## Alcance

**Dentro del alcance**:

- `Frontend/src/services/api.js` (modificar)
- `Frontend/src/context/AuthContext.jsx` (modificar — exportar las constantes de clave)

**Fuera del alcance** (NO tocar, aunque parezcan relacionados):

- Los 17 archivos de `Frontend/src/services/*.js`. El interceptor es global; no hay
  que tocar ni una función de servicio. Si te ves editando varios, algo va mal.
- Los 19 componentes de `Frontend/src/pages/`. Sus bloques `catch` genéricos siguen
  igual; simplemente dejarán de dispararse por sesión vencida.
- Migrar el token de `localStorage` a una cookie `HttpOnly`. Es un cambio de
  autenticación de punta a punta y no es lo que arregla este plan.
- Refresco de token / renovación silenciosa. No existe endpoint de refresh en el
  backend (`AuthController` solo expone `POST /api/auth/login`), así que no hay
  nada que llamar.
- `Frontend/src/routes/PrivateRoute.jsx` — la redirección de este plan ocurre por
  `window.location`, no por el enrutador. Si `plans/003` ya modificó este archivo,
  déjalo como está.
- Cualquier archivo del backend.

## Flujo de git

- Rama: `advisor/006-interceptor-401`
- Un solo commit basta. Mensajes en español o inglés; el repositorio no usa
  conventional commits.
- NO hagas push ni abras un PR salvo que el operador lo pida.

## Pasos

### Paso 1: Exportar las claves de almacenamiento desde `AuthContext`

En `Frontend/src/context/AuthContext.jsx`, cambia las dos constantes para que sean
exportadas:

```js
export const TOKEN_KEY = 'gymone_token'
export const USER_KEY = 'gymone_user'
```

No cambies nada más en ese archivo. Las constantes se siguen usando igual dentro
del módulo.

Esto evita que `api.js` repita los literales `'gymone_token'` y `'gymone_user'` —
hoy `api.js:8` ya duplica el primero, y duplicarlo otra vez multiplica el sitio
donde se rompe si algún día cambian.

**Verificar**: `npm run lint` → código 0.

### Paso 2: Añadir el interceptor de respuesta

En `Frontend/src/services/api.js`:

1. Importa `TOKEN_KEY` y `USER_KEY` desde `../context/AuthContext` y úsalos también
   en el interceptor de petición que ya existe, en lugar del literal actual.

   Comprueba que esto no cree un ciclo de importación: `AuthContext.jsx` importa
   `authService.js`, que importa `api.js`. Añadir `api.js` → `AuthContext.jsx`
   cierra el ciclo. Los bundlers de ES modules lo toleran cuando solo se importan
   constantes que no dependen del otro módulo en tiempo de inicialización, y aquí
   es el caso — pero **verifica con `npm run build` en el Paso 4**. Si el build
   falla o aparece un `undefined` en tiempo de ejecución, es una condición de
   PARADA: extrae las dos constantes a un archivo nuevo
   `Frontend/src/services/storageKeys.js` que ambos importen, e informa del cambio.

2. Añade el interceptor de respuesta después del de petición:

```js
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !window.location.pathname.startsWith('/login')) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
      sessionStorage.removeItem(TOKEN_KEY)
      sessionStorage.removeItem(USER_KEY)
      window.location.replace('/login?sesion=expirada')
    }
    return Promise.reject(error)
  },
)
```

Tres decisiones que hay que respetar tal cual:

- **La guarda de `/login` es obligatoria.** Sin ella, un intento de inicio de
  sesión con credenciales incorrectas — que el backend responde con 401 — provoca
  una recarga de la página de login y el usuario nunca ve el mensaje de "correo o
  contraseña incorrectos". Este es el error más probable al implementar esto.
- **`window.location.replace`, no `href`.** `replace` no deja la ruta rota en el
  historial, así que el botón "atrás" no devuelve al usuario a una pantalla que va
  a fallar otra vez.
- **`return Promise.reject(error)` es obligatorio.** El interceptor no debe tragarse
  el error: los `catch` de las páginas siguen ejecutándose, y eso está bien.

3. No añadas manejo para 403. Un 403 significa "autenticado pero sin permiso" —
   tras `plans/003` será una respuesta legítima y frecuente, y cerrar la sesión por
   un 403 sería un error grave.

**Verificar**: `npm run lint` → código 0.

### Paso 3: Mostrar por qué se cerró la sesión

En `Frontend/src/pages/Login/Login.jsx`, lee el parámetro `sesion` de la query
string y, si vale `expirada`, muestra un aviso encima del formulario:
`"Tu sesión expiró. Vuelve a iniciar sesión."`

Usa `useSearchParams` de `react-router-dom` (ya es dependencia, versión 7). Muestra
el mensaje con el mismo estilo que usa el archivo para sus errores de login
actuales — lee el componente y reutiliza su elemento de error en lugar de inventar
uno nuevo.

Sin este paso el usuario aparece de golpe en el login sin explicación, que es solo
un poco mejor que el estado actual.

Nota: `Login.jsx` tiene 478 líneas. Limítate a añadir la lectura del parámetro y el
render del aviso. Reorganizar ese archivo es otro asunto y está fuera del alcance.

**Verificar**: `npm run lint` → código 0.

### Paso 4: Compilar

**Verificar**: `npm run build` → código 0, sin advertencias de importación
circular. Si aparece una advertencia sobre un ciclo entre `api.js` y
`AuthContext.jsx`, aplica la salida descrita en el Paso 1 (archivo
`storageKeys.js`) y vuelve a compilar.

### Paso 5: Prueba manual de los tres escenarios

Con el backend corriendo y `npm run dev` levantado:

1. **Sesión vencida**: inicia sesión con normalidad. En las herramientas de
   desarrollo, edita el valor de `gymone_token` en `localStorage` para corromperlo
   (cambia unos caracteres del final). Navega a cualquier pantalla que cargue
   datos, por ejemplo Clientes. Esperado: redirección inmediata a `/login`, aviso
   de sesión expirada visible, y `localStorage` sin `gymone_token` ni
   `gymone_user`.
2. **Credenciales incorrectas**: en el login, envía una contraseña equivocada.
   Esperado: se muestra el error de credenciales del formulario, **sin** recarga de
   página ni bucle. Este es el escenario que rompe la implementación ingenua.
3. **Uso normal**: inicia sesión correctamente y recorre Dashboard, Clientes, Caja
   y Pagos. Esperado: ningún cierre de sesión inesperado.

Si `plans/003` ya está aplicado, añade un cuarto escenario: como
`RECEPCIONISTA`, provoca un 403 (por ejemplo intentando cerrar la caja) y confirma
que **no** te cierra la sesión.

**Verificar**: los tres (o cuatro) escenarios se comportan como se describe.
Informa de lo observado en cada uno.

## Plan de pruebas

No hay framework de pruebas en el frontend y este plan **no** debe instalar uno —
sería un cambio de herramientas mucho mayor que el arreglo. La verificación es la
prueba manual del Paso 5, y el escenario 2 (credenciales incorrectas) es el que
importa: es la regresión que introduce una implementación descuidada.

Si en el futuro se añade Vitest más Testing Library, el primer caso que vale la
pena escribir es exactamente ese: que un 401 en la ruta `/login` no dispare la
redirección.

## Criterios de finalización

Comprobables por máquina. TODOS deben cumplirse:

- [ ] `grep -c 'interceptors.response' Frontend/src/services/api.js` devuelve 1
- [ ] `grep -c "'gymone_token'" Frontend/src/services/api.js` devuelve 0 (usa la constante importada)
- [ ] `grep -c 'pathname.startsWith' Frontend/src/services/api.js` devuelve 1 (la guarda de `/login` está presente)
- [ ] `grep -c '403' Frontend/src/services/api.js` devuelve 0
- [ ] `npm run lint` termina en 0
- [ ] `npm run build` termina en 0 sin advertencias de importación circular
- [ ] Los tres escenarios del Paso 5 se verificaron y se informaron
- [ ] `git diff --name-only 8f78f50..HEAD` solo lista `api.js`, `AuthContext.jsx` y `Login.jsx`
- [ ] Fila de estado de 006 actualizada en `plans/README.md`

## Condiciones de PARADA

Detente e informa (no improvises) si:

- `npm run build` falla por una importación circular entre `api.js` y
  `AuthContext.jsx` incluso después de aplicar la salida del Paso 1.
- El escenario 2 del Paso 5 entra en bucle de recarga en el login. Significa que la
  guarda de ruta no está funcionando; no lo tapes con un temporizador ni con un
  contador de reintentos.
- Descubres que alguna parte del código crea su propia instancia de axios en vez de
  importar `api.js` — ese código se saltaría el interceptor por completo. Informa
  de qué archivo es.
- El backend resulta devolver 401 en algún caso que **no** es de autenticación (por
  ejemplo, `VentaService.crear` lanza `UNAUTHORIZED` cuando no encuentra el usuario
  del token, ver `VentaService.java:41-42`). Si ese caso se puede dar con una
  sesión válida, cerrar la sesión sería una reacción incorrecta y hay que decidir
  qué hacer.

## Notas de mantenimiento

- El interceptor es ahora el único sitio donde se decide qué hacer ante un 401.
  Cualquier manejo de 401 dentro de una página es redundante y debería quitarse
  cuando se encuentre.
- Si algún día se añade un endpoint de refresh en el backend, este interceptor es
  el punto donde se engancha: intentar el refresh antes de cerrar sesión, y cerrar
  solo si el refresh también falla.
- Interacción con `plans/002`: al rotar `JWT_SECRET` todos los tokens vigentes
  dejan de valer, así que todos los usuarios pasan por este camino a la vez. Es
  justamente el momento en que este plan demuestra su valor.
- Interacción con `plans/003`: ese plan hace que el 403 sea una respuesta normal.
  El interceptor lo ignora a propósito; quien revise el PR debe confirmar que sigue
  siendo así.
- Quien revise el PR debe fijarse sobre todo en la guarda de `/login` y en que se
  limpien **ambos** almacenamientos, no solo `localStorage`.
