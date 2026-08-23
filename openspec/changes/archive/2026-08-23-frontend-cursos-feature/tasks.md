<Tasks: frontend-cursos-feature>
## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 200 - 250 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Complete frontend feature for courses | PR 1 | `ng test` | `ng serve` | Git revert on frontend changes |

## Phase 1: Foundation & Models

- [x] 1.1 Update `frontend/src/app/features/cursos/models/curso.model.ts` to define `Curso` and `CursosFiltros` interfaces.
- [x] 1.2 Update `frontend/src/app/features/cursos/services/cursos.ts` to implement `getCursos(filters)`, `inscribirse(cursoId)`, and `darseDeBaja(cursoId)`.

## Phase 2: Organization Home Updates

- [x] 2.1 Update `frontend/src/app/features/organizaciones/pages/home-organizacion-page/home-organizacion-page.ts` to add `abrirModalPublicarCurso()` method setting `draftTipo` to `curso` on the reused modal.
- [x] 2.2 Update `frontend/src/app/features/organizaciones/pages/home-organizacion-page/home-organizacion-page.html` to add the "Crear curso" button next to existing opportunity buttons.

## Phase 3: Beneficiary Courses & Filtering

- [x] 3.1 Update `frontend/src/app/features/cursos/pages/listado-cursos-page/listado-cursos-page.ts` to manage state for filters, courses list, `inscribirse`, and `darseDeBaja` actions.
- [x] 3.2 Implement client-side filtering in `listado-cursos-page.ts` to omit any course where `cuposDisponibles === 0`.
- [x] 3.3 Update `frontend/src/app/features/cursos/pages/listado-cursos-page/listado-cursos-page.html` to build the filter UI (Modality, Province) and course grid. **Important:** Explicitly copy/reuse the exact CSS/styling conventions used in other forms in the project for the filter inputs and form elements.
- [x] 3.4 Wire enrollment and un-enrollment buttons in `listado-cursos-page.html` to their respective methods.

## Phase 4: Testing & Verification

- [x] 4.1 Write a RED test in `home-organizacion-page.spec.ts` for `abrirModalPublicarCurso` to verify type parameter is set to `curso`.
- [x] 4.2 Write a RED test in `listado-cursos-page.spec.ts` to verify full courses (`cuposDisponibles === 0`) are not rendered.
- [x] 4.3 Write a RED test in `listado-cursos-page.spec.ts` to verify filters trigger the `Cursos` service correctly.
- [x] 4.4 Write an integration RED test in `listado-cursos-page.spec.ts` verifying enrollment updates the `estaInscripto` UI state when the service is mocked.
- [x] 4.5 Make the RED tests pass (GREEN) and refactor if necessary.
</Tasks: frontend-cursos-feature>
