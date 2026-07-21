# Puente Laboral

Repositorio inicial del proyecto — smoke test end-to-end de infraestructura.

- `/backend` → API en NestJS
- `/frontend` → Angular (standalone)
- `docker-compose.yml` → levanta ambos servicios

El frontend, al cargar, hace un GET a `/health` del backend y muestra en
pantalla el texto "Hola", el status code de la respuesta y el JSON recibido.

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
