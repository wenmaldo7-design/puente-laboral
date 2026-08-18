# Puente Laboral

- `/backend` → API en NestJS
- `/frontend` → Angular (standalone)
- `docker-compose.yml` → levanta ambos servicios

## Estado actual

Implementado end-to-end: registro y login de **beneficiarios** (`/backend/src/auth`,
`/frontend/src/app/features/auth`), con sesión vía cookie JWT httpOnly.

Las autenticaciones de **empresa** y **administrador** son flujos separados que
todavía no están implementados, a propósito: cada tipo de usuario tiene reglas
de auth propias y no comparten lógica con la de beneficiario.

El resto de los módulos de dominio (`cursos`, `empresas`, `mentorias`,
`notificaciones`, `ofertas-laborales`, `reportes`, `seguimiento`) están
scaffoldeados (carpetas, rutas y clases vacías) pero sin implementar todavía.

## Levantar todo con Docker Compose

Requiere Docker y Docker Compose.

```bash
docker-compose up --build
```

- Backend disponible en http://localhost:3000/health
- Frontend disponible en http://localhost:4200

Para detener:

```bash
docker-compose down
```

## Modo desarrollo (sin Docker)

### Backend

```bash
cd backend
npm install
npm run start:dev
```

El backend queda escuchando en http://localhost:3000 (endpoint de salud en
`/health`).

### Frontend

```bash
cd frontend
npm install
npm start
```

El frontend queda escuchando en http://localhost:4200 y por defecto apunta a
`http://localhost:3000` como URL del backend (configurado en
`frontend/public/env.js`). Si el backend corre en otra URL, editá ese archivo.
