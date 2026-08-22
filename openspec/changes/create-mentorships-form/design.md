# Design: create-mentorships-form

## Technical Approach

We will build a reactive form in Angular (`PublicarMentoriaPage`) and a backend endpoint `POST /empresas/mentorias` to create mentorships. The mentorship will be saved by inserting a `servicios` record (type: `mentoria`) and its corresponding `mentorias` detail record in a Prisma transaction. The system will restrict the endpoint to `empresa` roles. Since mentorships do not have a draft state, they will be instantly published with an active publication state.

## Architecture Decisions

### Decision: Mentorship Entity Extension
**Choice**: Extend the `mentorias` Prisma model with `requisitos` (String) and `duracion_minutos` (Int) to satisfy the spec requirements, rather than reusing `descripcion` to pack this info.
**Alternatives considered**: Store requirements and duration as part of the `descripcion` text.
**Rationale**: The specification treats these as distinct required fields for validation. Having them as separate columns enables better UI presentation and future filtering (e.g. by duration).

### Decision: API Routing for Companies
**Choice**: Create a new `MentoriasEmpresaController` mapped to `/empresas/mentorias`.
**Alternatives considered**: Add `POST` to the existing `MentoriasBeneficiarioController` and rename it to `MentoriasController`.
**Rationale**: Separation of concerns. The beneficiary controller focuses on listing, enrolling, and cancelling, while the company controller focuses on creating and managing the mentorship lifecycle.

### Decision: State Management for Immediate Publishing
**Choice**: Set the `id_estado_publicacion` in the backend service directly to the ID representing "publicado" when creating the mentorship.
**Alternatives considered**: Expose a `status` field in the payload.
**Rationale**: The spec strictly states it MUST be instantly published without drafts. Enforcing this at the service layer prevents the client from trying to save drafts.

## Data Flow

```
[Empresa UI: PublicarMentoriaPage]
      │
      │ (1) POST /empresas/mentorias (CreateMentoriaDto)
      ▼
[Backend: MentoriasEmpresaController]
      │
      │ (2) validate payload (class-validator)
      ▼
[Backend: MentoriasEmpresaService]
      │
      │ (3) Prisma: tx.servicios.create (tipo_servicio: 'mentoria', id_estado: 'publicado')
      │ (4) Prisma: tx.mentorias.create (fecha, hora_inicio, requisitos, duracion_minutos, etc.)
      ▼
[PostgreSQL Database]
```

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `backend/prisma/schema.prisma` | Modify | Add `requisitos String?` and `duracion_minutos Int?` to `mentorias` model |
| `backend/src/mentorias/dto/create-mentoria.dto.ts` | Create | DTO for creating a mentorship (validates title, description, requirements, duration, modality, etc.) |
| `backend/src/mentorias/mentorias-empresa.controller.ts` | Create | Controller for `/empresas/mentorias` with a POST endpoint protected by `@Roles('empresa')` |
| `backend/src/mentorias/mentorias-empresa.service.ts` | Create | Service with `crearMentoria()` method handling a Prisma transaction to insert `servicios` and `mentorias` |
| `backend/src/mentorias/mentorias.module.ts` | Modify | Register the new controller and service |
| `frontend/src/app/features/mentorias/services/mentorias-empresa.service.ts` | Create | Frontend service for `POST /empresas/mentorias` |
| `frontend/src/app/features/mentorias/pages/publicar-mentoria-page/publicar-mentoria-page.ts` | Modify | Implement reactive form with validation and submit logic |
| `frontend/src/app/features/mentorias/pages/publicar-mentoria-page/publicar-mentoria-page.html` | Modify | Add the HTML form UI for mentorship details |
| `frontend/src/app/features/empresas/empresas.routes.ts` | Modify | Add route `mentorias/publicar` for companies |
| `frontend/src/app/features/empresas/pages/home-empresa-page/home-empresa-page.html` | Modify | Add "Crear mentoría" button to the dashboard actions |

## Interfaces / Contracts

```typescript
// backend/src/mentorias/dto/create-mentoria.dto.ts
export class CreateMentoriaDto {
  @IsString() @MaxLength(150) titulo: string;
  @IsString() @IsOptional() descripcion?: string;
  @IsString() requisitos: string;
  @IsInt() duracion_minutos: number;
  @IsInt() id_area: number;
  @IsDateString() fecha: string;
  @IsString() hora_inicio: string; // "HH:mm"
  @IsString() @IsIn(['presencial', 'virtual', 'hibrida']) modalidad: string;
  @IsInt() @IsOptional() id_provincia?: number;
  @IsString() @IsOptional() @MaxLength(300) link_o_canal?: string;
}
```

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | Validation of `CreateMentoriaDto` | Assert that missing required fields throw ValidationPipes errors. |
| Unit | Creation logic in `MentoriasEmpresaService` | Mock Prisma transaction to verify correct mappings for `servicios` and `mentorias`, including the hardcoded published state. |
| Integration | `POST /empresas/mentorias` endpoint | Test that a user with `empresa` role can create a mentorship and receives 201 Created. Test that a `beneficiario` or unauthenticated user receives 403/401. |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.

## Migration / Rollout

A Prisma schema migration is required to add `requisitos` and `duracion_minutos` to the `mentorias` table. Run `npx prisma migrate dev` before deploying. No complex data migration is needed as the table doesn't have required strict non-null fields for existing data (they can be optional in the DB, while strictly enforced at API validation layer).

## Open Questions

- [ ] Does the `id_estado_publicacion` for "publicado" have a constant, or do we query it by name `('Publicado')`? We will assume a database query by name or a known hardcoded ID.
