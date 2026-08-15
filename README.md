# Puente Laboral

Plataforma que conecta a personas en situación de vulnerabilidad social con
oportunidades de empleo, formación y mentoría.

Este README resume el estado actual del trabajo en frontend para que
cualquiera del equipo pueda entender rápido dónde está parado el proyecto.

## Stack técnico

- **Frontend**: Angular (standalone components, signals), sin NgModules.
- **Backend**: NestJS — en desarrollo por otro miembro del equipo.
- **Base de datos**: Supabase (PostgreSQL) — stack decidido, todavía no
  integrado en el backend (que hoy solo expone un endpoint `/health`).
- **Estilos**: Tailwind, integrado al mergear `origin/staging` — hoy se usa
  en Home pública y está pensado para las pantallas de Organización (a
  cargo de Maxi). Las pantallas de Beneficiario y Mentorías siguen con CSS
  propio por componente, sin Tailwind.

## Estructura de carpetas del frontend

El frontend organiza el código **por feature**, no por tipo de archivo. Cada
feature vive en `frontend/src/app/features/<feature>/` con esta forma:

```
frontend/src/app/features/beneficiarios/
  models/                       # interfaces de datos de la feature
  services/                     # un service por pantalla/dominio, providedIn: 'root'
  pages/
    home-beneficiario-page/     # componente + template + estilos + spec
    perfil-beneficiario-page/
  beneficiarios.routes.ts       # rutas de la feature, lazy-loaded desde app.routes.ts

frontend/src/app/features/mentorias/
  models/
  services/                     # Mentorias, InscripcionesMentorias
  pages/
    listado-mentorias-page/
    detalle-mentoria-page/
  mentorias.routes.ts

frontend/src/app/shared/ui/
  header/                       # <app-header>, usado por cualquier feature
  footer/                       # <app-footer>, usado por cualquier feature
```

`shared/ui/` es para componentes de presentación reutilizables entre
features (no específicos de Beneficiarios). `header`/`footer` usan clases
con prefijo genérico (`app-header`, `app-footer`, etc.) y colores propios
hardcodeados, sin depender de las custom properties CSS que define cada
página — así cualquier feature los puede usar sin acoplarse al tema visual
de otra. El Header muestra el logo real de la marca (`frontend/public/logo.png`),
no un ícono genérico.

Convenciones que venimos siguiendo:

- Cada `service` expone métodos que devuelven `Observable`, para que sea
  transparente reemplazar un mock por una llamada HTTP real más adelante
  (mismo tipo de retorno, misma forma de dato).
- Los componentes son standalone, usan `signal`/`computed` para el estado. Las
  cargas de datos que solo asignan el resultado de un `Observable` a un
  signal usan `toSignal()` (`@angular/core/rxjs-interop`) en vez de
  `subscribe()` manual; cuando hay lógica extra en el callback (setear más
  de un signal, side-effects) se mantiene el `subscribe()` manual.
- Los formularios de alta y los campos editables de Perfil Beneficiario usan
  `ReactiveFormsModule` (`FormBuilder`/`NonNullableFormBuilder` +
  `Validators`); el resto de las interacciones simples sigue leyendo
  `event.target` en los handlers, sin `FormsModule`/`ngModel`.
- Los componentes de presentación (p. ej. `Header`) exponen sus datos de
  entrada con Signal Inputs (`input()`) en vez de `@Input()` clásico.
- Cada página trae su propio `.spec.ts` con cobertura de render y de las
  interacciones principales (clicks, edición inline, filtros).

## Estado actual de las features

### Signup Beneficiario

Diseñado en Figma. Campos definidos: email, password, nombre, apellido, DNI.
Se coordinó con el resto del equipo para no repetir campos que ya se piden
acá con los que se editan después en Perfil Beneficiario. Todavía no tiene
implementación en código.

### Home Beneficiario — implementado

`features/beneficiarios/pages/home-beneficiario-page/`

Componente + servicio (`BeneficiarioHomeService`) + modelo + tests. Usa datos
mock a la espera de que el backend tenga los endpoints reales de
oportunidades, postulaciones y notificaciones. Incluye:

- Buscador de oportunidades.
- Filtros por tipo de servicio (Todo / Empleo / Cursos / Mentorías).
- Oportunidades recomendadas con porcentaje de match.
- Métricas rápidas (postulaciones, en curso, notificaciones).
- Últimas actualizaciones de postulaciones.

### Perfil Beneficiario — implementado

`features/beneficiarios/pages/perfil-beneficiario-page/`

Componente + servicio (`PerfilBeneficiarioService`) + modelo + tests, también
con datos mock. Edición inline por sección (ícono de lápiz → editar el campo
puntual → Guardar/Cancelar), sin un formulario único para toda la pantalla.

Mejoras técnicas aplicadas tras el code review de Mauri:

- Las cargas de datos que solo asignan el resultado del `Observable` a un
  signal (catálogo de habilidades, catálogo de áreas de interés) usan
  `toSignal()` en vez de `subscribe()` manual. El signal `perfil` se
  mantiene con `subscribe()` manual a propósito: se reescribe con
  `.update()` en varios métodos de guardado, y `toSignal()` devuelve un
  signal de solo lectura.
- Todos los campos editables usan `ReactiveFormsModule`
  (`FormGroup`/`FormControl` vía `NonNullableFormBuilder`): los campos
  simples (Fecha de nacimiento, Ubicación, Dirección, Teléfono), Sobre mí, y
  Enlaces (LinkedIn/GitHub/CV, como un único `FormGroup` que se guarda y
  cancela en conjunto). Las entradas de Experiencia y Educación comparten un
  mismo `FormGroup` reutilizado por la entrada activa (cada entrada se sigue
  editando de forma independiente). La excepción son Habilidades y Áreas de
  interés, que mantienen su mecanismo manual por la lógica de autocompletado
  con catálogo cerrado, que no encaja bien con Reactive Forms.
- El `<app-header>` que usa esta pantalla (compartido con Home y Mentorías)
  expone sus datos con Signal Inputs (`input()`) en vez de `@Input()`
  clásico.
- Como toda la pantalla comparte un único signal de "edición activa" (solo
  una sección o entrada editable a la vez), pasar a editar otra sección
  mientras había cambios sin guardar los descartaba en silencio. Ahora se
  pide confirmación ("Tenés cambios sin guardar, ¿querés descartarlos?")
  antes de descartar, comparando el estado del formulario contra el valor
  original (dirty check).

Particularidades:

- Email y DNI se muestran pero **no son editables** (campos de verificación).
- Fecha de nacimiento usa un input `type="date"` (selector nativo del
  navegador) en vez de texto libre.
- Teléfono aplica una máscara de formato automática ("351-555-0102") mientras
  se escribe, mediante un listener sobre `valueChanges` del `FormControl`
  (`setValue(..., { emitEvent: false })`), sin manipular el DOM directamente
  ni depender de ninguna librería externa.
- Habilidades y Áreas de interés son editables con el mismo patrón (lápiz +
  Guardar/Cancelar), adaptado a listas de tags: cada pill tiene su "×" para
  quitarla, y un buscador con autocompletado permite agregar tags nuevos
  eligiendo de un catálogo cerrado — no se puede escribir texto libre, para
  que el matching con oportunidades no se rompa por variantes de tipeo. El
  filtro del buscador es por prefijo (el nombre debe *empezar* con lo
  tipeado, case-insensitive), no por substring. El catálogo de Habilidades
  tiene 95 opciones agrupadas en 22 categorías (el dropdown muestra
  encabezados de categoría); Áreas de interés tiene 25 opciones y queda
  como lista plana, sin agrupar.

### Mentorías — implementado

`features/mentorias/pages/listado-mentorias-page/` y `detalle-mentoria-page/`

Componentes + servicios (`Mentorias`, `InscripcionesMentorias`) + modelos +
tests, con datos mock (5 mentorías variadas en temática y modalidad) a la
espera de que el backend tenga los endpoints reales. Incluye:

- Listado con buscador (por título y descripción) y filtro por modalidad
  (Todas / Presencial / Virtual).
- Detalle de una mentoría por `:id`, leído con `ActivatedRoute`, con badge
  de % de match cuando la mentoría lo tiene.
- Inscripción simulada: el botón "Inscribirme" actualiza el estado en
  memoria (se pierde al recargar la página, todavía no hay backend). El
  link/canal de una mentoría virtual solo se revela después de confirmar
  la inscripción, y nunca para mentorías presenciales.
- Baja de la inscripción ("Darme de baja"), con estilo secundario para no
  competir visualmente con la confirmación — reactiva el botón
  "Inscribirme" para poder volver a anotarse.

### Signup Organización

Se armó una propuesta de implementación y luego se descartó: la va a
desarrollar Maxi con su propio enfoque.

## Rutas

El router de Angular ya está cableado (`app.config.ts` usa
`provideRouter(routes)`; `app.html` es solo `<router-outlet></router-outlet>`,
ya no hay montaje manual de páginas para revisarlas). Rutas actuales, todas
lazy-loaded excepto la raíz:

- `/` — Home pública (de Roland, `features/home`).
- `/beneficiario/home` — Home Beneficiario.
- `/beneficiario/perfil` — Perfil Beneficiario.
- `/beneficiario/mentorias` — Listado de Mentorías.
- `/beneficiario/mentorias/:id` — Detalle de una mentoría.

## Cómo levantar el proyecto (modo desarrollo)

```bash
cd frontend
npm install
npm start
```

Queda escuchando en **http://localhost:4200**. Por defecto apunta a
`http://localhost:3000` como URL del backend (configurado en
`frontend/public/env.js`); si el backend corre en otra URL, editá ese
archivo.

En paralelo, para tener el backend arriba:

```bash
cd backend
npm install
npm run start:dev
```

El backend queda en **http://localhost:3000** (endpoint de salud en
`/health`).

También se puede levantar todo junto con Docker Compose (`docker-compose up
--build`), que expone el backend en `:3000` y el frontend en `:4200`.

## Pendientes conocidos

- **Conectar servicios mock a endpoints reales**: `BeneficiarioHomeService`,
  `PerfilBeneficiarioService`, `Mentorias` e `InscripcionesMentorias` ya
  están estructurados para esto (cada método mock tiene comentada al lado
  la llamada HTTP real) — falta que el backend exponga los endpoints
  correspondientes.
- **Catálogo de Habilidades / Áreas de interés**: hoy está hardcodeado en el
  frontend (`PerfilBeneficiarioService`), pendiente de reemplazar por uno
  centralizado cuando exista en el backend.
- **Warning de presupuesto de CSS** en `perfil-beneficiario-page.css`
  (4.88kB vs. el límite de warning de 4kB; no bloquea el build, el límite
  de error es 8kB).
- **Signup Organización**: descartado de este alcance, queda a cargo de Maxi.
- **Testing multi-navegador**: por ahora solo se probó manualmente en Safari.
