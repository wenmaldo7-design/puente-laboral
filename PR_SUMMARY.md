# Resumen de Cambios: Dashboard y Seguimiento de Candidatos para Organizaciones

Este Pull Request implementa el **Dashboard de Empresas** y el sistema de **Seguimiento de Candidatos**, cubriendo tanto la interfaz de usuario como la lógica de negocio y las validaciones de concurrencia en la base de datos.

## 🚀 Nuevas Funcionalidades

### 1. Panel de Métricas de la Empresa (Dashboard)
- Se habilitaron los endpoints `GET /empresas/metricas` y `GET /empresas/postulaciones/recientes`.
- La pantalla principal ahora muestra métricas reales: **total de oportunidades activas, postulaciones recibidas, postulaciones pendientes y el % promedio de match**.
- Las tarjetas de "Oportunidades Publicadas" muestran el conteo en tiempo real de candidatos.

### 2. Gestión de Candidatos por Oportunidad
- **Nueva Vista de Candidatos:** Se agregó la página `CandidatosOportunidadPage`. Al hacer click en una oportunidad del dashboard, el usuario navega a `/empresas/ofertas-laborales/:id/candidatos` para ver exclusivamente a los postulantes de esa vacante.
- **Cambio de Estados:** Se integró un menú desplegable en la tarjeta de cada candidato para cambiar su estado a `pendiente`, `en_proceso`, `entrevistado`, `aceptada` o `rechazada`.

### 3. Reglas de Negocio y Seguridad (Backend)
- **Control Estricto de Vacantes:** El endpoint `PATCH /empresas/postulaciones/:id/estado` valida que no se puedan "Aceptar" más candidatos que las vacantes disponibles. Se implementó un bloqueo a nivel de fila (`SELECT FOR UPDATE` en Prisma) para evitar condiciones de carrera si se aceptan varios candidatos en simultáneo.
- **Notificaciones Automáticas:** Cuando la empresa cambia el estado de un postulante, el sistema le dispara automáticamente una notificación interna al beneficiario (`POSTULACION_CAMBIO_ESTADO`).

## 🛠 Cambios Técnicos y Correcciones

- **Estados de Postulación:** Se agregó el script SQL `0004_add_estados_postulaciones.sql` y se actualizó `seed.ts` para soportar los nuevos estados (`en_proceso`, `entrevistado`).
- **DTOs:** Se crearon `ActualizarEstadoPostulacionDto` y `CandidatoEmpresaResponseDto` para la validación de datos.
- **Dockerfiles:** Se cambió la instrucción `npm ci` por `npm install` en los `Dockerfile` de Frontend y Backend para resolver problemas de sincronización de `package-lock.json` al levantar contenedores en distintos sistemas operativos.

## 📝 Notas para el Equipo (Supabase)
- **No se subió ningún `.env`**: Las variables de entorno quedaron excluidas para mantener segura la conexión a Supabase de cada desarrollador.
- Las migraciones de SQL (`0004_...`) deben ejecutarse manualmente en el editor SQL de Supabase para que los nuevos estados impacten en producción o staging.

---
**Ramas afectadas:** `feat/dashboard-organizaciones-admin`
