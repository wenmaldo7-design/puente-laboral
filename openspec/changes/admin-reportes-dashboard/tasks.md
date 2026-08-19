</SDD Phase — Common Protocol>
<Tasks: admin-reportes-dashboard>
## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 600-800 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 → PR 2 → PR 3 |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Admin DB Seed & Backend Metrics Endpoints | PR 1 | `npm run test -- admin-reports.service.spec.ts` (in backend) | curl GET `/admin-reports/metrics` | Revert `seed.ts` and `AdminReportsModule` |
| 2 | Backend Export Endpoints (PDF & Excel) | PR 2 | `npm run test -- admin-reports.controller.spec.ts` (in backend) | curl GET export endpoints and verify headers | Revert export methods in controller/service |
| 3 | Frontend Admin Dashboard & Auth Redirect | PR 3 | `npm run test -- admin` (in frontend) | Login as admin and see dashboard in browser | Revert frontend `/admin` route and components |

## Phase 1: Database & Foundation
- [x] 1.1 `backend/prisma/seed.ts`: Update seed script to insert default admin user (`admin@puentelaboral.com` / `admin123`) into `usuarios` and `administradores`.
- [x] 1.2 `backend/src/admin-reports/admin-reports.module.ts`: Create NestJS module and register it in `app.module.ts`.

## Phase 2: Backend Core (Metrics & Exports)
- [x] 2.1 `backend/src/admin-reports/admin-reports.service.ts`: Implement method for total active job offers query.
- [x] 2.2 `backend/src/admin-reports/admin-reports.service.ts`: Implement method for total accepted candidates query.
- [x] 2.3 `backend/src/admin-reports/admin-reports.service.ts`: Implement method for match percentage (overlapping skills / required skills for accepted candidates).
- [ ] 2.4 `backend/src/admin-reports/admin-reports.service.ts`: Implement methods to generate Excel (.xlsx) and PDF buffers/streams based on filtered data.
- [x] 2.5 `backend/src/admin-reports/admin-reports.controller.ts`: Expose GET `/admin-reports/metrics?timeRange=...`.
- [ ] 2.6 `backend/src/admin-reports/admin-reports.controller.ts`: Expose GET `/admin-reports/export/excel` and `/admin-reports/export/pdf`.

## Phase 3: Frontend Integration
- [ ] 3.1 `frontend/src/app/features/admin/services/admin-reports.service.ts`: Create Angular service to consume backend metric and export endpoints.
- [ ] 3.2 `frontend/src/app/features/auth/pages/login-page/login-page.ts`: Update post-login redirect for `administrador` role to route to `/admin/dashboard`.
- [ ] 3.3 `frontend/src/app/features/admin/admin.routes.ts`: Create routing module and wire it into the main app routes.
- [ ] 3.4 `frontend/src/app/features/admin/pages/dashboard-page/dashboard-page.ts`: Create component logic (fetch metrics, handle 30 days/1 year/all time filters, trigger file downloads).
- [ ] 3.5 `frontend/src/app/features/admin/pages/dashboard-page/dashboard-page.html`: Create template UI with filter buttons, metrics display, and "Todavía no hay datos" empty states.

## Phase 4: Testing
- [x] 4.1 `backend/src/admin-reports/admin-reports.service.spec.ts`: Unit test metrics calculation logic and math operations.
- [ ] 4.2 `backend/src/admin-reports/admin-reports.controller.spec.ts`: Test export endpoints for correct response types.
- [ ] 4.3 `frontend/src/app/features/admin/pages/dashboard-page/dashboard-page.spec.ts`: Test component UI logic, empty states display, and routing.
</Tasks: admin-reportes-dashboard>
