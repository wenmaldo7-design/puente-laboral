# Tasks: create-mentorships-form

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 250 - 350 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Full implementation of API and UI | PR 1 | `npm run test` (backend) & `npm run test` (frontend) | Local dev server | Revert PR 1 |

## Phase 1: Foundation (Backend Database & Models)

- [x] 1.1 Modify `backend/prisma/schema.prisma`: Add `requisitos String?` and `duracion_minutos Int?` to `mentorias` model.
- [x] 1.2 Create `backend/src/mentorias/dto/create-mentoria.dto.ts` with validation constraints (title, description, requirements, duration, modality, etc).

## Phase 2: Core Implementation (Backend Services & Controllers)

- [x] 2.1 Create `backend/src/mentorias/mentorias-empresa.service.ts`: Implement `crearMentoria()` with a Prisma transaction inserting `servicios` and `mentorias` (hardcode `id_estado` to 'publicado').
- [x] 2.2 Create `backend/src/mentorias/mentorias-empresa.controller.ts`: Implement `POST /empresas/mentorias` restricted by `@Roles('empresa')`.
- [x] 2.3 Modify `backend/src/mentorias/mentorias.module.ts`: Register the new controller and service.

## Phase 3: Integration (Frontend Services & Components)

- [x] 3.1 Create `frontend/src/app/features/mentorias/services/mentorias-empresa.service.ts`: Implement `POST /empresas/mentorias` API call.
- [x] 3.2 Modify `frontend/src/app/features/mentorias/pages/publicar-mentoria-page/publicar-mentoria-page.ts`: Implement reactive form logic with validation mapping to DTO.
- [x] 3.3 Modify `frontend/src/app/features/mentorias/pages/publicar-mentoria-page/publicar-mentoria-page.html`: Create the form UI inputs and submit button.
- [x] 3.4 Modify `frontend/src/app/features/empresas/empresas.routes.ts`: Add route `mentorias/publicar`.
- [x] 3.5 Modify `frontend/src/app/features/empresas/pages/home-empresa-page/home-empresa-page.html`: Add "Crear mentoría" button linking to the new route.

## Phase 4: Testing & Verification

- [x] 4.1 Write unit tests for `CreateMentoriaDto` validation (missing fields error).
- [x] 4.2 Write unit tests for `MentoriasEmpresaService` creation logic (assert Prisma transaction and status mapped correctly).
- [x] 4.3 Write integration test for `POST /empresas/mentorias`: Verify `empresa` role success and `beneficiario`/unauthenticated 403/401 rejections.
