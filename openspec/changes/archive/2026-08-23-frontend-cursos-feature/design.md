<Design: frontend-cursos-feature>
## Technical Approach

We will extend the Organization home page to include a dedicated "Crear curso" button, reusing the existing opportunity publication modal but pre-selecting the "Curso / Capacitación" type. For the Beneficiary flow, we will implement the `listado-cursos-page` with search, modality, and province filters. The list will automatically filter out courses where `cuposDisponibles === 0`. The `Cursos` service will be implemented to handle fetching, enrolling, and unenrolling from courses.

## Architecture Decisions

### Decision: Reuse Organization Opportunity Modal

**Choice**: Add a specific action `abrirModalPublicarCurso()` that reuses the existing `modalPublicarAbierto` but forces `draftTipo` to `curso`.
**Alternatives considered**: Create a completely new modal component exclusively for courses.
**Rationale**: The existing modal already handles title, location/modality, and description, which align perfectly with course creation. Reusing it reduces code duplication and keeps the UI consistent.

### Decision: Client-side vs Server-side Filtering for Full Courses

**Choice**: Filter full courses on the client side by omitting any course where `cuposDisponibles === 0`, in addition to passing query parameters to the backend.
**Alternatives considered**: Rely entirely on backend filtering to omit full courses.
**Rationale**: Providing client-side filtering offers a robust safety net against race conditions or delayed cache updates, ensuring a course that just became full on the client's state is immediately hidden from the list.

## Data Flow

    [Beneficiary UI] ──(Filtros: Mod/Prov)──→ [Cursos Service] ──→ [Backend API]
           │                                          │
           └──(Inscribirse / Baja)────────────────────┘
           
    [Organization UI] ──(Crear Curso)──→ [OrganizacionHome Service] ──→ [Backend API]

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `frontend/src/app/features/organizaciones/pages/home-organizacion-page/home-organizacion-page.html` | Modify | Add a specific "Crear curso" button next to the existing one. |
| `frontend/src/app/features/organizaciones/pages/home-organizacion-page/home-organizacion-page.ts` | Modify | Add `abrirModalPublicarCurso()` to handle setting the default type. |
| `frontend/src/app/features/cursos/pages/listado-cursos-page/listado-cursos-page.html` | Modify | Build the UI with search filters (Modality, Province), course grid, and enrollment buttons. |
| `frontend/src/app/features/cursos/pages/listado-cursos-page/listado-cursos-page.ts` | Modify | Add state for filters, courses, and methods to handle `inscribirse` and `darseDeBaja`. |
| `frontend/src/app/features/cursos/models/curso.model.ts` | Modify | Define `Curso` interface and filter types. |
| `frontend/src/app/features/cursos/services/cursos.ts` | Modify | Implement HTTP calls for `getCursos`, `inscribirse`, and `darseDeBaja`. |

## Interfaces / Contracts

```typescript
// frontend/src/app/features/cursos/models/curso.model.ts
export interface Curso {
  id: string;
  titulo: string;
  modalidad: string;
  provincia: string;
  descripcion: string;
  cuposTotales: number;
  cuposDisponibles: number;
  estaInscripto: boolean;
  organizacionNombre: string;
}

export interface CursosFiltros {
  modalidad?: string;
  provincia?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Organization Home | Verify `abrirModalPublicarCurso` correctly sets the type to `curso` and opens modal. |
| Unit | Listado Cursos | Verify courses with `cuposDisponibles === 0` are not rendered. |
| Unit | Listado Cursos | Verify filters correctly update the service call. |
| Integration | Enrollment | Mock `Cursos` service and verify `inscribirse` updates the UI state (`estaInscripto` true). |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

No migration required. This is purely a frontend UI addition utilizing existing components.

## Open Questions

- [ ] Does the backend currently support the exact filter keys `modalidad` and `provincia` on the `/cursos` endpoint?
- [ ] Are we mocking the backend responses initially, or are the endpoints fully deployed?
</Design: frontend-cursos-feature>
