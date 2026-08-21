## Review Workload Forecast

Decision needed before apply: Yes
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

Not needed for this risk level.

## Phase 1: Foundation

- [ ] 1.1 Create `backend/src/ofertas-laborales/dto/actualizar-oferta-laboral.dto.ts` using `@nestjs/mapped-types` `PartialType` based on `CrearOfertaLaboralDto`.
- [ ] 1.2 Create `backend/src/ofertas-laborales/dto/candidato-empresa-response.dto.ts` with properties for `id_postulacion`, `id_usuario_beneficiario`, `nombre`, `apellido`, `email`, `fecha_postulacion`, `estado_postulacion`, `cv_url`, and `carta_presentacion`.

## Phase 2: Core Implementation

- [x] 2.1 Update `backend/src/ofertas-laborales/ofertas-laborales.service.ts`: add `actualizar` method that checks `idUsuarioEmpresa` ownership and updates the opportunity.
- [x] 2.2 Update `backend/src/ofertas-laborales/ofertas-laborales.service.ts`: add `eliminar` method that checks `idUsuarioEmpresa` ownership and soft-deletes by updating `id_estado_publicacion`.
- [x] 2.3 Update `backend/src/ofertas-laborales/ofertas-laborales.service.ts`: add `obtenerCandidatos` method that checks ownership and joins `postulaciones_laborales` with `beneficiarios` to return a list mapped to `CandidatoEmpresaResponseDto`.

## Phase 3: Integration

- [x] 3.1 Update `backend/src/ofertas-laborales/ofertas-laborales.controller.ts`: add `@Patch(':id')` endpoint utilizing `ActualizarOfertaLaboralDto` and calling `service.actualizar`.
- [x] 3.2 Update `backend/src/ofertas-laborales/ofertas-laborales.controller.ts`: add `@Delete(':id')` endpoint calling `service.eliminar`.
- [x] 3.3 Update `backend/src/ofertas-laborales/ofertas-laborales.controller.ts`: add `@Get(':id/candidatos')` endpoint calling `service.obtenerCandidatos`.

## Phase 4: Testing

- [ ] 4.1 Write RED test for `ofertas-laborales.service.spec.ts`: `actualizar` throws Forbidden/NotFound if opportunity is not owned by the company.
- [ ] 4.2 Write GREEN code to pass 4.1.
- [ ] 4.3 Write RED test for `ofertas-laborales.service.spec.ts`: `eliminar` throws Forbidden/NotFound if opportunity is not owned.
- [ ] 4.4 Write GREEN code to pass 4.3.
- [ ] 4.5 Write RED test for `ofertas-laborales.service.spec.ts`: `obtenerCandidatos` throws Forbidden/NotFound if opportunity is not owned.
- [ ] 4.6 Write GREEN code to pass 4.5.
- [ ] 4.7 Write RED test for `ofertas-laborales.service.spec.ts`: `eliminar` updates state instead of deleting the record (soft delete).
- [ ] 4.8 Write GREEN code to pass 4.7.
