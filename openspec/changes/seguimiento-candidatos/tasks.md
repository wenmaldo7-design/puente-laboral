## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250-300 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Not needed |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

Not needed (Low risk change).

## Phase 1: Foundation

- [x] 1.1 Generate database migration to insert `en_proceso` and `entrevistado` into `estados_postulaciones` and `POSTULACION_CAMBIO_ESTADO` into `tipos_notificaciones`.
- [x] 1.2 Update `backend/src/notificaciones/notificaciones.plantillas.ts` to add `POSTULACION_CAMBIO_ESTADO` type and template.
- [x] 1.3 Create `backend/src/ofertas-laborales/dto/actualizar-estado-postulacion.dto.ts` to validate the incoming `estado` payload.

## Phase 2: Core Backend

- [x] 2.1 Test: Write unit tests in `empresas-dashboard.service.spec.ts` for vacancy limits, concurrency, and notification dispatch.
- [x] 2.2 Update `backend/src/ofertas-laborales/empresas-dashboard.service.ts` to implement state update logic with row-level locks on `ofertas_laborales`, vacancy limit check, and notification trigger.
- [x] 2.3 Update `backend/src/ofertas-laborales/empresas-dashboard.controller.ts` to add the `@Patch('postulaciones/:id/estado')` endpoint.

## Phase 3: Frontend Integration

- [x] 3.1 Update `frontend/src/app/features/empresas/models/empresa-home.model.ts` to include new state string types if defined.
- [x] 3.2 Update `frontend/src/app/features/empresas/services/empresa-home.service.ts` to add `actualizarEstadoPostulacion` observable method.
- [x] 3.3 Update `frontend/src/app/features/empresas/pages/home-empresa-page/home-empresa-page.ts` to handle state change selection and gracefully handle API vacancy errors.
- [x] 3.4 Update `frontend/src/app/features/empresas/pages/home-empresa-page/home-empresa-page.html` to replace the static `.postulante-estado` label with a `<select>` dropdown.

## Phase 4: Verification

- [x] 4.1 Verify backend integration test ensures only one state update passes if vacancy limit is 1.
- [x] 4.2 Verify frontend dropdown E2E behavior triggers API call and displays feedback.
