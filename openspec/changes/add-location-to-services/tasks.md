# Tasks: add-location-to-services

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250-350 |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Backend) → PR 2 (Frontend) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Backend schema & APIs | PR 1 | `npm run test` | `N/A` | Revert backend commits |
| 2 | Frontend forms and filtering | PR 2 | `npm run test` | `npm start` | Revert frontend commits |

## Phase 1: Backend Foundation (PR 1)

- [x] 1.1 `backend/prisma/schema.prisma`: Add `id_provincia Int?` to `servicios` model and relation to `provincias`.
- [x] 1.2 `backend/src/catalogos/catalogos.controller.ts` & `.service.ts`: Create `GET /catalogos/provincias` endpoint.
- [x] 1.3 `backend/src/ofertas-laborales/dto/crear-oferta-laboral.dto.ts`: Add `provincia?: string`, conditionally required (`@ValidateIf`) for 'presencial' or 'hibrida'. Add 'hibrida' to `MODALIDADES_VALIDAS`.
- [x] 1.4 `backend/src/ofertas-laborales/dto/actualizar-oferta-laboral.dto.ts`: Add `provincia?: string`.
- [x] 1.5 `backend/src/ofertas-laborales/dto/oferta-laboral-response.dto.ts` & `backend/src/mentorias/dto/mentoria-response.dto.ts`: Add `provincia: string | null`.
- [x] 1.6 `backend/src/ofertas-laborales/ofertas-laborales.service.ts`: Map `provincia` to `id_provincia` during `crear`/`actualizar`.
- [x] 1.7 `backend/src/ofertas-laborales/ofertas-laborales-beneficiario.service.ts` & `backend/src/mentorias/mentorias-beneficiario.service.ts`: Include `provincias` in queries and map to response.

## Phase 2: Frontend Core & UI (PR 2)

- [x] 2.1 `frontend/src/app/features/ofertas-laborales/models/oferta-laboral.model.ts`: Add `provincia?: string` and `"hibrida"` to `ModalidadOferta`. Apply to Mentoria models.
- [x] 2.2 `frontend/src/app/features/ofertas-laborales/services/ofertas-laborales.ts`: Add `getCatalogoProvincias()` method.
- [x] 2.3 `frontend/src/app/features/ofertas-laborales/pages/publicar-oferta-page/publicar-oferta-page.ts`: Fetch provinces, add `provincia` control, apply conditional required validator.
- [x] 2.4 `frontend/src/app/features/ofertas-laborales/pages/publicar-oferta-page/publicar-oferta-page.html`: Add `<select>` dropdown for province.
- [x] 2.5 `frontend/src/app/features/ofertas-laborales/pages/detalle-oferta-page/detalle-oferta-page.html` & `detalle-mentoria-page.html`: Render province if present.
- [x] 2.6 `frontend/src/app/features/ofertas-laborales/pages/listado-ofertas-page/listado-ofertas-page.ts` & `.html`: Add `filtroProvincia` signal and filter logic, add dropdown UI.
- [x] 2.7 `frontend/src/app/features/mentorias/pages/listado-mentorias-page/listado-mentorias-page.ts` & `.html`: Add `filtroProvincia` filter and dropdown UI.

## Phase 3: Testing

- [x] 3.1 Write test: Verify `CrearOfertaLaboralDto` rejects missing province when presencial/hibrida.
- [x] 3.2 Write test: Verify frontend `ofertasFiltradas` correctly filters by `filtroProvincia`.
- [x] 3.3 Write test: Verify `OfertasLaboralesService` links `id_provincia` on creation.
