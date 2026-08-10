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
  beneficiarios.routes.ts       # rutas de la feature (ver "Pendientes")

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
- Los componentes son standalone, usan `signal`/`computed` para el estado y
  se comunican con el DOM leyendo `event.target` en los handlers (sin
  `FormsModule`/`ngModel`), salvo los formularios de alta que usan
  `ReactiveFormsModule` (`FormBuilder` + `Validators`).
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
Particularidades:

- Email y DNI se muestran pero **no son editables** (campos de verificación).
- Fecha de nacimiento usa un input `type="date"` (selector nativo del
  navegador) en vez de texto libre.
- Teléfono aplica una máscara de formato automática ("351-555-0102") mientras
  se escribe, sin depender de ninguna librería externa.
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

### Signup Organización

Se armó una propuesta de implementación y luego se descartó: la va a
desarrollar Maxi con su propio enfoque.

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

- **Conectar servicios mock a endpoints reales**: `BeneficiarioHomeService` y
  `PerfilBeneficiarioService` ya están estructurados para esto (cada método
  mock tiene comentada al lado la llamada HTTP real) — falta que el backend
  exponga los endpoints correspondientes.
- **Router de Angular sin cablear**: `beneficiarios.routes.ts` existe pero
  todavía no está registrado en `app.config.ts`. Decisión pendiente de
  coordinar con el equipo antes de conectarlo.
- **Catálogo de Habilidades / Áreas de interés**: hoy está hardcodeado en el
  frontend (`PerfilBeneficiarioService`), pendiente de reemplazar por uno
  centralizado cuando exista en el backend.
- **Warning de presupuesto de CSS** en `perfil-beneficiario-page.css`
  (4.88kB vs. el límite de warning de 4kB; no bloquea el build, el límite
  de error es 8kB).
- **Signup Organización**: descartado de este alcance, queda a cargo de Maxi.
- **Testing multi-navegador**: por ahora solo se probó manualmente en Safari.
