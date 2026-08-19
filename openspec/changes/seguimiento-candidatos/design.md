<Design: seguimiento-candidatos>
## Technical Approach

We will extend the application state tracking by adding `en_proceso` and `entrevistado` to the `estados_postulaciones` table via a database migration. We will create a `PATCH /empresas/postulaciones/:id/estado` endpoint in the backend to allow authorized companies to update the state of an application. The update logic will use a database transaction with a row-level lock (`SELECT ... FOR UPDATE` on `ofertas_laborales`) to safely enforce the vacancy limits when attempting to transition to the `aceptada` state. Finally, the state change will trigger an internal call to the notifications service to alert the candidate. In the frontend, the candidate list view will replace the static state label with a dropdown to trigger this new endpoint.

## Architecture Decisions

### Decision: State Update Concurrency

**Choice**: Use `SELECT ... FOR UPDATE` on the `ofertas_laborales` table before checking the vacancy count.
**Alternatives considered**: Optimistic locking with a version field.
**Rationale**: Row-level locking matches the existing `postularme` endpoint implementation, ensuring consistency without schema changes.

### Decision: In-app Notification Trigger

**Choice**: Emit notifications synchronously within the same backend process immediately following the database transaction.
**Alternatives considered**: Asynchronous event queue (e.g. Redis).
**Rationale**: Keeps the architecture simple and avoids introducing new infrastructure dependencies since the application currently handles notifications synchronously.

## Data Flow

    Frontend ──(PATCH /empresas/postulaciones/:id/estado)──→ EmpresasDashboardController
                                                                    │
         ┌──────────── Prisma Transaction ──────────────────────────┤
         │                                                          ▼
         │  1. Check ownership                              EmpresasDashboardService
         │  2. FOR UPDATE on ofertas_laborales                      │
         │  3. Check vacantes count (if accepting)                  │
         │  4. UPDATE postulaciones_laborales                       │
         │  5. Call NotificacionesService                           │
         └──────────────────────────────────────────────────────────┘

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/prisma/migrations/xxxx_add_estados_postulaciones/migration.sql` | Create | Insert `en_proceso` and `entrevistado` into the `estados_postulaciones` table. Insert `POSTULACION_CAMBIO_ESTADO` into `tipos_notificaciones`. |
| `backend/src/notificaciones/notificaciones.plantillas.ts` | Modify | Add `POSTULACION_CAMBIO_ESTADO` type and its corresponding template. |
| `backend/src/ofertas-laborales/dto/actualizar-estado-postulacion.dto.ts` | Create | DTO to validate the incoming payload `{ estado: string }`. |
| `backend/src/ofertas-laborales/empresas-dashboard.controller.ts` | Modify | Add `@Patch('postulaciones/:id/estado')` endpoint. |
| `backend/src/ofertas-laborales/empresas-dashboard.service.ts` | Modify | Implement state update logic with vacancy limit check and notification creation. |
| `frontend/src/app/features/empresas/services/empresa-home.service.ts` | Modify | Add API method to execute the PATCH request. |
| `frontend/src/app/features/empresas/models/empresa-home.model.ts` | Modify | Update state type definitions if any restrict valid values. |
| `frontend/src/app/features/empresas/pages/home-empresa-page/home-empresa-page.ts` | Modify | Add handler to invoke the service and gracefully handle errors. |
| `frontend/src/app/features/empresas/pages/home-empresa-page/home-empresa-page.html` | Modify | Change the `.postulante-estado` label to a `<select>` dropdown. |

## Interfaces / Contracts

```typescript
// backend/src/ofertas-laborales/dto/actualizar-estado-postulacion.dto.ts
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class ActualizarEstadoPostulacionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pendiente', 'en_proceso', 'entrevistado', 'aceptada', 'rechazada'])
  estado: string;
}

// frontend/src/app/features/empresas/services/empresa-home.service.ts
actualizarEstadoPostulacion(idPostulacion: number, estado: string): Observable<void>;
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | State validation logic | Ensure `empresas-dashboard.service.ts` throws `ConflictException` if vacancies are full. |
| Unit | Notification dispatch | Mock `NotificacionesService` to ensure `crear` is called with the correct parameters on success. |
| Integration | Concurrency limit | Mock concurrent PATCH requests to ensure only one passes if vacancy limit is 1. |
| E2E | Frontend dropdown update | Verify the dropdown triggers an API call and correctly reflects state changes or displays a clear error. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

A standard Prisma database migration to populate the new state strings `en_proceso` and `entrevistado` into the `estados_postulaciones` table. The migration must also insert the `POSTULACION_CAMBIO_ESTADO` notification type into `tipos_notificaciones`. No phased rollout required.

## Open Questions

- [ ] Should changing the state to `rechazada` follow the exact same notification flow, or does it require a differently worded template?
- [ ] Are there specific transitions that should be disallowed (e.g. moving back from `aceptada` to `pendiente`), or can the company arbitrarily change states?
</Design: seguimiento-candidatos>
