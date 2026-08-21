<Design: empresa-dashboard>
## Technical Approach

The `empresa-dashboard` feature builds upon the existing backend structure for `empresas` and `ofertas-laborales`. The metrics and recent candidates endpoints (`GET /empresas/metricas` and `GET /empresas/postulaciones/recientes`) as well as the listing and creation endpoints for opportunities are already implemented. 

This design focuses on implementing the remaining API endpoints to complete the contract specified in the `oportunidades-management` and `candidatos-tracking` specs: updating and deleting opportunities, and retrieving the candidates for a specific opportunity. We will extend the `OfertasLaboralesController` and `OfertasLaboralesService` to fulfill these requirements.

## Architecture Decisions

### Decision: Soft Deletion for Opportunities

**Choice**: Soft delete opportunities by updating `id_estado_publicacion` to point to a 'cerrada', 'inactiva' or 'eliminada' state.
**Alternatives considered**: Hard delete using `prisma.servicios.delete`.
**Rationale**: The specification mandates that deleting an opportunity should preserve candidate historical records. Hard deleting would cascade and remove `postulaciones_laborales`, destroying history for candidates. A soft delete safely retains the records while excluding them from active lists.

### Decision: Update Strategy (PATCH)

**Choice**: Implement a `PATCH` endpoint with a `PartialType` DTO.
**Alternatives considered**: `PUT` endpoint requiring the entire object payload.
**Rationale**: Partial updates (`PATCH`) provide more flexibility for the frontend. For instance, updating only the `vacantes` or `fecha_limite` does not require resending the entire list of `habilidades` or the `descripcion`.

### Decision: Candidate List Response Format

**Choice**: Create a flattened `CandidatoEmpresaResponseDto` that combines relevant data from `postulaciones_laborales` (status, date, cv_url) and `beneficiarios` (name, email).
**Alternatives considered**: Return nested Prisma objects directly.
**Rationale**: Using a dedicated DTO prevents leaking unnecessary or sensitive candidate information (e.g., `dni`, `fecha_nacimiento`) and provides a stable API contract that is easier for the frontend to consume.

## Data Flow

    Frontend ──(PATCH /:id)──→ OfertasLaboralesController ──→ OfertasLaboralesService ──(Transaction)──→ Database (servicios, ofertas_laborales)
    Frontend ──(DELETE /:id)─→ OfertasLaboralesController ──→ OfertasLaboralesService ──(Update state)─→ Database (servicios)
    Frontend ──(GET /:id/candidatos)──→ OfertasLaboralesController ──→ OfertasLaboralesService ──(Query)──→ Database (postulaciones_laborales + beneficiarios)

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/src/ofertas-laborales/dto/actualizar-oferta-laboral.dto.ts` | Create | DTO using `PartialType(CrearOfertaLaboralDto)` for the PATCH endpoint. |
| `backend/src/ofertas-laborales/dto/candidato-empresa-response.dto.ts` | Create | DTO to represent a candidate's application details and status. |
| `backend/src/ofertas-laborales/ofertas-laborales.controller.ts` | Modify | Add `PATCH /:id`, `DELETE /:id`, and `GET /:id/candidatos` endpoints. |
| `backend/src/ofertas-laborales/ofertas-laborales.service.ts` | Modify | Implement `actualizar`, `eliminar` (soft-delete), and `obtenerCandidatos` methods, enforcing company ownership checks. |

## Interfaces / Contracts

```typescript
// backend/src/ofertas-laborales/dto/candidato-empresa-response.dto.ts
export class CandidatoEmpresaResponseDto {
  id_postulacion: number;
  id_usuario_beneficiario: number;
  nombre: string;
  apellido: string;
  email: string;
  fecha_postulacion: Date;
  estado_postulacion: string;
  cv_url?: string | null;
  carta_presentacion?: string | null;
  // match_porcentaje?: number; (Optional: could be included if desired later)
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Service ownership checks | Mock Prisma to assert `actualizar`/`eliminar`/`obtenerCandidatos` throw 403/404 if the opportunity does not belong to `idUsuarioEmpresa`. |
| Unit | Update logic | Verify `actualizar` properly handles partial updates, including the update of `ofertas_habilidades` if provided. |
| Integration | Endpoints | E2E test hitting `PATCH`, `DELETE`, and `GET /candidatos` endpoints. Ensure `DELETE` properly transitions the state instead of dropping records. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No database schema migration required. A seed or manual check to ensure a "cerrada" or "eliminada" state exists in `estados_publicacion_servicios` may be needed depending on the current catalog. 

## Open Questions

- [ ] Does the `estados_publicacion_servicios` table already contain an 'eliminada' or 'cerrada' state, or should we insert one via a manual migration script? (Assuming it exists or can be seeded).
