# Design: add-location-to-services

## Technical Approach

We will add an `id_provincia` column directly to the `servicios` base table in Prisma, establishing a relation to the existing `provincias` table. Since `ofertas_laborales` and `mentorias` both share `servicios` as their base record, this approach natively adds location support to all services. We will expose the provinces catalog in a new `catalogos` endpoint. The Job Offers creation endpoint will be updated to accept a province name and resolve it, and the Angular frontend will fetch the catalog to render the required province dropdown in forms. Finally, we'll expose a new client-side province filter in the listing pages for both services.

## Architecture Decisions

### Decision: Adding location directly to `servicios`

**Choice**: Add `id_provincia` to `servicios` with a foreign key to `provincias`.
**Alternatives considered**: Add `id_provincia` separately to `ofertas_laborales` and `mentorias` schemas. Add it as a free-text column.
**Rationale**: Pushing it to the base `servicios` model reduces redundancy, ensures schema consistency, and makes queries simpler. Both specialized models already share `id_servicio`. Reusing the existing `provincias` table (instead of free-text) satisfies the "24 Argentine provinces dropdown" requirement and prevents data anomalies.

### Decision: Frontend filtering execution

**Choice**: Use Angular's `computed` signals for client-side filtering on `listado-ofertas-page` and `listado-mentorias-page`.
**Alternatives considered**: Implement server-side filtering via query parameters (e.g., `GET /beneficiarios/ofertas-laborales?provincia=...`).
**Rationale**: The existing listing pages already handle modality and text search entirely client-side using a single cached API response. Preserving this pattern keeps the UI fast and responsive without requiring additional backend infrastructure for filtering.

## Data Flow

    Component Form (publicar-oferta)
         │  (GET /catalogos/provincias)
         │  (POST /empresas/ofertas-laborales {..., provincia: 'Córdoba'})
         ▼
    OfertasLaboralesService
         │  (Resolve 'Córdoba' against DB catalog)
         ▼
    PostgreSQL (servicios table)
         │  (Fetch includes provincias)
         ▼
    Beneficiario Listings (GET /beneficiarios/...)
         │  (Filter client-side via Angular computed signals)
         ▼
    UI Rendering

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/prisma/schema.prisma` | Modify | Add `id_provincia Int?` and relation to `servicios` model. |
| `backend/src/catalogos/catalogos.controller.ts` | Modify | Expose `GET /catalogos/provincias` endpoint. |
| `backend/src/catalogos/catalogos.service.ts` | Modify | Implement `listarProvincias()` reading from `provincias` table. |
| `backend/src/ofertas-laborales/dto/crear-oferta-laboral.dto.ts` | Modify | Add `provincia?: string` with conditional required validation (`@ValidateIf`). Include `'hibrida'` in `MODALIDADES_VALIDAS`. |
| `backend/src/ofertas-laborales/dto/actualizar-oferta-laboral.dto.ts` | Modify | Add `provincia?: string`. |
| `backend/src/ofertas-laborales/ofertas-laborales.service.ts` | Modify | Map `provincia` to `id_provincia` during `crear` and `actualizar`. Map name in return DTOs. |
| `backend/src/ofertas-laborales/dto/oferta-laboral-response.dto.ts` | Modify | Add `provincia: string \| null` (apply to similar response DTOs). |
| `backend/src/ofertas-laborales/ofertas-laborales-beneficiario.service.ts` | Modify | Update `INCLUDE_OFERTA` to include `provincias` and map it to `aResponseDto`. |
| `backend/src/mentorias/dto/mentoria-response.dto.ts` | Modify | Add `provincia: string \| null`. |
| `backend/src/mentorias/mentorias-beneficiario.service.ts` | Modify | Update `INCLUDE_MENTORIA` to include `provincias` and map it to `aResponseDto`. |
| `frontend/src/app/features/ofertas-laborales/services/ofertas-laborales.ts` | Modify | Add `getCatalogoProvincias()` returning `string[]`. |
| `frontend/src/app/features/ofertas-laborales/models/oferta-laboral.model.ts` | Modify | Add `provincia?: string` and `"hibrida"` to `ModalidadOferta`. Apply to Mentoria models too. |
| `frontend/src/app/features/ofertas-laborales/pages/publicar-oferta-page/publicar-oferta-page.ts` | Modify | Add `provincia` form control, load catalog, and conditionally require based on `modalidad`. |
| `frontend/src/app/features/ofertas-laborales/pages/publicar-oferta-page/publicar-oferta-page.html` | Modify | Add `<select>` for province. |
| `frontend/src/app/features/ofertas-laborales/pages/listado-ofertas-page/listado-ofertas-page.ts` (and `.html`) | Modify | Add `filtroProvincia` signal, update `ofertasFiltradas` computed logic, add dropdown UI. |
| `frontend/src/app/features/mentorias/pages/listado-mentorias-page/listado-mentorias-page.ts` (and `.html`) | Modify | Replicate province filter logic for Mentorships. |
| `frontend/src/app/features/ofertas-laborales/pages/detalle-oferta-page/detalle-oferta-page.html` | Modify | Render `provincia` in the detail view if present. |
| `frontend/src/app/features/mentorias/pages/detalle-mentoria-page/detalle-mentoria-page.html` | Modify | Render `provincia` in the detail view if present. |

## Interfaces / Contracts

```typescript
// Updated Modalidad
export type ModalidadOferta = 'virtual' | 'presencial' | 'hibrida';

// Extended DTO Responses
export interface OfertaLaboralBeneficiarioResponseDto {
  // ... existing fields
  modalidad: string;
  provincia: string | null;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Validation Logic | Verify `CrearOfertaLaboralDto` rejects missing province when modality is presencial or hibrida. |
| Unit | Frontend Filter | Verify `ofertasFiltradas` and `mentoriasFiltradas` correctly exclude services not matching the active `filtroProvincia`. |
| Integration | OfertasLaboralesService | Verify creating an offer with a valid province correctly links `id_provincia` in `servicios` and maps back the string name. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required (the new `id_provincia` column in `servicios` will default to `null`, ensuring retro-compatibility for existing records).

## Open Questions

- [ ] `publicar-mentoria-page.ts` is currently an empty scaffold with no backend create endpoint. This design covers all location aspects for Mentorías (DB, backend queries, frontend listing, details), but the actual Create Mentoria form will need to implement the field when the page logic is fleshed out in a separate PR. Are we aligned?
