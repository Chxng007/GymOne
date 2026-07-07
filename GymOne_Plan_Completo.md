# GymOne — Plan Completo del Proyecto

> Todo tu gimnasio, en un solo lugar.
> Producto comercial. Instalación independiente por cliente (no SaaS multi-tenant).

**Stack definitivo:**
- **Frontend:** React 19 + Vite + JSX + React Router
- **Backend:** Spring Boot 3 + Spring Security + JWT (mismo patrón que ROMP GPS)
- **Base de datos:** PostgreSQL propio (uno por instalación/cliente)
- **Storage:** local con `FileStorageService` (mismo patrón que DanzApp)
- **Contenedores:** Docker Compose (backend + frontend + Postgres)
- **Deploy:** por definir más adelante (pendiente, no es prioridad ahora)

---

## FASE 0 — Investigación y Arquitectura

**Objetivo:** no escribir código. Definir todo el sistema.

### Arquitectura general

Capas del backend:
```
Controller (REST) → Service (lógica de negocio) → Repository (Spring Data JPA) → Entity ↔ PostgreSQL
```
Autenticación JWT stateless. Un solo rol por ahora (`ADMINISTRADOR`), con `Usuario.rol` como campo desde el día uno.

### Flujo de navegación

```
/login  /  /dashboard  /clientes  /clientes/:id  /clientes/nuevo
/membresias  /pagos  /caja  /asistencia  /entrenadores  /rutinas
/inventario  /ventas  /gastos  /reportes  /configuracion
```
`PrivateRoute` en frontend valida sesión; la seguridad real vive en Spring Security (filtro JWT en cada endpoint).

Layout: `<AppLayout><Sidebar/><Topbar/><main><Outlet/></main></AppLayout>`

### Base de datos (PostgreSQL / JPA)

Una sola base de datos por instalación → no se necesita `gimnasio_id` en cada tabla.

```sql
configuracion_gimnasio (fila única)
  id, nombre, logo_url, direccion, telefono, moneda default 'COP',
  impuesto_porcentaje default 0, horario_apertura, horario_cierre

usuarios
  id, nombre, correo, contrasena_hash,
  rol default 'ADMINISTRADOR', activo default true

clientes
  id, foto_url, primer_nombre, segundo_nombre nullable, documento unique,
  fecha_nacimiento, telefono, correo nullable, direccion nullable,
  contacto_emergencia_nombre, contacto_emergencia_telefono, eps nullable,
  observaciones nullable, peso_kg nullable, altura_cm nullable,
  objetivo nullable, estado default 'ACTIVO'  -- ACTIVO | SUSPENDIDO | VENCIDO
  -- edad e IMC se calculan en el Service, nunca se guardan

planes_membresia
  id, nombre, duracion_dias, precio, beneficios, activo default true

suscripciones
  id, cliente_id FK, plan_id FK, fecha_inicio, fecha_fin,
  estado default 'ACTIVA', congelada_desde nullable

pagos
  id, cliente_id FK, suscripcion_id FK nullable,
  tipo (PAGO|ABONO|DESCUENTO|PROMOCION),
  metodo (EFECTIVO|TARJETA|TRANSFERENCIA|NEQUI|DAVIPLATA),
  monto, fecha default now(), registrado_por_id FK, nota nullable

caja_sesiones
  id, fecha, hora_apertura, hora_cierre nullable,
  saldo_inicial, saldo_final nullable, responsable_id FK,
  estado default 'ABIERTA'  -- ABIERTA | CERRADA

caja_movimientos
  id, caja_sesion_id FK, tipo (INGRESO|EGRESO), concepto, monto,
  referencia_pago_id FK nullable, fecha default now()
  -- regla: no abrir 2 sesiones el mismo día (validado en CajaService)

asistencias
  id, cliente_id FK, hora_entrada, hora_salida nullable, fecha default current_date

entrenadores
  id, nombre, telefono, especialidad, horario

rutinas
  id, cliente_id FK, entrenador_id FK nullable, nombre, fecha_inicio

rutina_dias
  id, rutina_id FK, dia

rutina_ejercicios
  id, rutina_dia_id FK, ejercicio, series, repeticiones,
  peso nullable, descanso_segundos nullable, notas nullable, video_url nullable

productos
  id, nombre, categoria (PROTEINA|CREATINA|ACCESORIO|BEBIDA|SNACK),
  costo, precio, stock, proveedor nullable

ventas
  id, fecha default now(), total, descuento default 0,
  metodo_pago, registrado_por_id FK

venta_items
  id, venta_id FK, producto_id FK, cantidad, precio_unitario

gastos
  id, categoria (ARRIENDO|SERVICIOS|INTERNET|SALARIOS|COMPRAS|MANTENIMIENTO),
  descripcion, monto, fecha

notificaciones
  id, tipo (VENCIMIENTO|STOCK_BAJO|CAJA_ABIERTA|PAGO_PENDIENTE),
  mensaje, leida default false, cliente_relacionado_id nullable, created_at default now()
```

### Roles y permisos

Un solo rol (`ADMINISTRADOR`) validado por Spring Security. Preparado para el futuro con `@PreAuthorize`:

| Rol | Acceso previsto |
|---|---|
| ADMINISTRADOR | Todo |
| RECEPCIONISTA | Clientes, Asistencia, Pagos, Ventas |
| ENTRENADOR | Sus clientes asignados y Rutinas |

### Componentes reutilizables (mini librería UI)

`Button, Input, Select, Table, Card, Modal, Drawer, Toast, Badge, Avatar, Tabs, Progress, Calendar, Charts, Loading, Skeleton` — viven en `/src/components/ui/`, sin lógica de negocio.

### Sistema de diseño

Tema oscuro. Tokens:
```css
--color-bg:#0f1115; --color-surface:#1a1d24; --color-surface-alt:#22252e; --color-border:#2c303a;
--color-primary:#6d5efc; --color-primary-hover:#8577ff;
--color-success:#3ecf8e; --color-warning:#f5b942; --color-danger:#f0576b;
--color-text:#e6e8ec; --color-text-muted:#9aa0ac;
--radius-sm:6px; --radius-md:10px; --radius-lg:16px;
--spacing-1:4px; --spacing-2:8px; --spacing-3:16px; --spacing-4:24px; --spacing-5:32px;
```
Tipografía sans-serif clara (ej. Inter). Color comunica estado: verde=activo/al día, amarillo=por vencer, rojo=vencido/crítico.

### Dashboard y KPIs

Endpoint `GET /api/dashboard/resumen` (implementado en `DashboardService`) devuelve: clientes activos, clientes vencidos, ingresos hoy, ingresos del mes, nuevos clientes, renovaciones, asistencia hoy, productos vendidos, ganancia mensual, caja del día.

### Estructura de carpetas

```
gymone-backend/
├── src/main/java/com/gymone/
│   ├── config/ (SecurityConfig, JwtFilter, CorsConfig)
│   ├── controller/  ├── service/  ├── repository/  ├── entity/  ├── dto/
│   ├── security/ (JwtUtil, UserDetailsServiceImpl)
│   └── exception/ (GlobalExceptionHandler)
├── src/main/resources/application.properties
└── docker-compose.yml

gymone-frontend/
├── src/
│   ├── components/{ui,layout}/
│   ├── pages/{Dashboard,Clientes,Membresias,Pagos,Caja,Asistencia,
│   │          Entrenadores,Rutinas,Inventario,Ventas,Gastos,Reportes,Configuracion}/
│   ├── services/ (api.js + *Service.js)
│   ├── hooks/  ├── context/ (AuthContext)
│   ├── routes/ (AppRoutes.jsx)
│   ├── styles/ (variables.css, global.css)
│   ├── utils/ (calcularEdad, calcularIMC, formatearMoneda)
│   ├── App.jsx  └── main.jsx
└── .env (VITE_API_URL)
```

---

## FASE 1 — Proyecto Base

**Objetivo:** dejar lista toda la infraestructura de desarrollo.

- Backend: proyecto Spring Boot (Web, Security, JPA, driver PostgreSQL, JWT), `docker-compose.yml` con backend + Postgres.
- Entidad `Usuario` + endpoint de login que devuelve JWT.
- Frontend: proyecto Vite + React + React Router, `AuthContext`, `PrivateRoute`.
- `AppLayout` con Sidebar y Topbar, tema oscuro aplicado.
- Dashboard vacío, ya conectado a un endpoint real de prueba.
- Componentes base (`Button`, `Input`) para poder construir el login.

---

## FASE 2 — Sistema de Diseño

**Objetivo:** construir la mini librería de UI descrita en la Fase 0.

Componentes: `Button, Input, Select, Table, Card, Modal, Drawer, Toast, Badge, Avatar, Tabs, Progress, Calendar, Charts, Loading, Skeleton`. Todos reutilizables, sin conocimiento de negocio, consumiendo solo las variables CSS del tema oscuro.

---

## FASE 3 — Autenticación

**Objetivo:** usuarios del gimnasio y roles.

- Rol único por ahora: `ADMINISTRADOR` (acceso total).
- Login con JWT (Spring Security), refresco/expiración de token, logout.
- Estructura preparada para agregar `RECEPCIONISTA` y `ENTRENADOR` después vía `@PreAuthorize`, sin migrar el modelo.

---

## FASE 4 — Dashboard Ejecutivo

**Objetivo:** aquí empieza el sistema real.

Mostrar con gráficas: clientes activos, clientes vencidos, ingresos hoy, ingresos del mes, nuevos clientes, renovaciones, asistencia hoy, productos vendidos, ganancia mensual, caja del día. Todo servido por `GET /api/dashboard/resumen`.

---

## FASE 5 — Clientes

**Objetivo:** el corazón del sistema.

Cada cliente: foto, primer nombre, segundo nombre (opcional), documento, fecha de nacimiento (edad calculada), teléfono, correo, dirección, contacto de emergencia, EPS, observaciones, peso, altura (IMC calculado), objetivo. Estado: activo / suspendido / vencido.

---

## FASE 6 — Membresías

**Objetivo:** crear planes (Mensual, Anual, Personalizado).

Cada plan: precio, duración, beneficios. Suscripción del cliente: estado (activa/congelada/vencida), acciones de congelar y renovar.

---

## FASE 7 — Pagos

**Objetivo:** todo el dinero.

Registrar pago, abono, descuento, promoción. Métodos: efectivo, tarjeta, transferencia, Nequi, Daviplata. Historial completo.

*Nota de negocio:* la plataforma no gestiona cobros — las transferencias son directas entre cliente y encargado (quien debe tener su propio QR o llaves de pago). El sistema solo registra.

---

## FASE 8 — Caja

**Objetivo:** control diario del dinero (muy importante).

Apertura, ingresos, egresos, saldo, cierre, responsable, reporte de caja. Regla crítica validada en `CajaService`: no se puede abrir una nueva sesión si ya hay una abierta ese día.

---

## FASE 9 — Asistencia

**Objetivo:** control de entrada de clientes.

Buscar cliente, registrar entrada, registrar salida, historial. Más adelante: código QR para autoservicio.

---

## FASE 10 — Entrenadores

**Objetivo:** gestión del personal técnico.

Asignar clientes a entrenadores, horario, especialidad, acceso a las rutinas de sus clientes.

---

## FASE 11 — Rutinas

**Objetivo:** construcción completa de rutinas de entrenamiento.

Por día: ejercicio, series, repeticiones, peso, descanso, notas, video de referencia.

---

## FASE 12 — Inventario

**Objetivo:** control de productos del gimnasio (proteínas, creatina, guantes, botellas, bebidas, snacks).

Controlar entradas, salidas, stock, costo, precio, proveedor.

---

## FASE 13 — Ventas

**Objetivo:** punto de venta interno.

Venta rápida, factura, descuento, selección de productos, registro de pago.

---

## FASE 14 — Gastos

**Objetivo:** registrar egresos operativos.

Arriendo, servicios, internet, salarios, compras, mantenimiento.

---

## FASE 15 — Reportes

**Objetivo:** reportes completos por módulo.

Clientes, ingresos, ventas, inventario, caja, renovaciones, entrenadores, asistencia.

---

## FASE 16 — Configuración

**Objetivo:** datos generales del gimnasio.

Logo, nombre, dirección, horarios, moneda, impuestos — todo desde la tabla `configuracion_gimnasio` (fila única).

---

## FASE 17 — Notificaciones

**Objetivo:** alertas operativas.

Cliente vence mañana, producto agotado, caja abierta, pago pendiente. Se generan con jobs programados (`@Scheduled` en Spring Boot) que evalúan estas condiciones periódicamente.

---

## FASE 18 — Optimización

**Objetivo:** rendimiento y mantenibilidad antes de escalar funcionalidades.

Lazy loading de rutas, custom hooks, `memo`/`useMemo` donde aplique, separación clara de servicios, revisión de queries N+1 en el backend (JPA).

---

## FASE 19 — Deploy

**Objetivo:** llevar el sistema a producción.

*Pendiente de definir en detalle* — se retoma más adelante. Lo que ya sabemos: cada cliente corre su propia instalación (Docker Compose: backend + Postgres + frontend), no hay dependencia de Supabase ni Vercel para el backend. Dominio, HTTPS, backups y estrategia de actualización se definen cuando llegue el momento.

---

## FASE 20 — Detalles finales

**Objetivo:** pulir cuando ya existan clientes reales.

Código QR, firma digital, seguimiento de pagos cliente-gimnasio, exportar a PDF y Excel.

---

## Módulos del sistema (resumen)

📊 Dashboard · 👥 Clientes · 💳 Membresías · 💰 Pagos · 🏦 Caja · 📅 Asistencia
💪 Rutinas · 📦 Inventario · 🛒 Ventas · 💸 Gastos · 📈 Reportes · 🔔 Notificaciones · ⚙ Configuración

## Orden recomendado para el MVP inicial

Para tener algo vendible cuanto antes, el orden de valor es: **Dashboard → Clientes → Membresías → Pagos → Caja → Asistencia → Inventario/Ventas → Reportes.** El resto (Entrenadores, Rutinas, Notificaciones avanzadas, QR, firma digital) se agrega después de validar con los primeros clientes reales.
