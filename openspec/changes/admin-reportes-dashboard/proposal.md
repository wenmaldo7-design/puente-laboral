</SDD Phase — Common Protocol>
<Proposal: admin-reportes-dashboard>
## Intent

Implement a Dashboard for the Admin role to display key job placement metrics ("reportes de inserción laboral"). This will solve the current gap where the Admin role has backend auth support but lacks a dedicated frontend view and the necessary data endpoints. The dashboard will provide visibility into platform performance by tracking active job offers, accepted candidates, and the match quality between candidates and vacancies.

## Scope

### In Scope
- Seed an admin user in the database (`usuarios` -> `administradores`) to allow login.
- Add frontend route and view for the Admin Dashboard (redirecting from login instead of `/empresas/solicitudes`).
- Implement backend endpoints for metrics:
  - Total active job offers
  - Total accepted candidates
  - Match percentage (comparing candidate skills against vacancy required skills)
- Add interactive time filters to the dashboard (30 days, 1 year, all time).
- Add functionality to export reports to Excel or PDF.
- Implement empty states ("Todavía no hay datos") for metrics with no data.

### Out of Scope
- Filtering by specific companies (deferred).
- Additional complex metrics beyond the core 3 requested.
- Managing admin users (CRUD for admins) beyond the initial seed.

## Capabilities

> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.

### New Capabilities
- `admin-dashboard`: Admin dashboard view with metrics and time filters (30 days, 1 year, all time).
- `metrics-export`: Exporting dashboard metrics to Excel or PDF.
- `admin-auth-seed`: Seeding an admin user for authentication and routing them appropriately post-login.

### Modified Capabilities
None

## Approach

- **DB Seed**: Create a Prisma seed script to insert a default admin user into `usuarios` and `administradores`.
- **Backend**: Create a new module/controller (e.g., `AdminReportsModule`) with endpoints to calculate the 3 metrics. The match percentage calculation will query the candidate's skills against the job's required skills for accepted applications. Implement an export endpoint to generate Excel/PDF files on the server (or return structured data for frontend export, depending on existing stack patterns).
- **Frontend**: Create a new Angular component for the Admin Dashboard. Update the auth redirect logic in the login component to route admins to the new dashboard instead of `/empresas/solicitudes`. Add UI for the time filters, export buttons, and empty state components.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/prisma/seed.ts` (or equivalent) | Modified | Add admin user seed. |
| `backend/src/admin-reports` | New | Module for admin reports and metrics calculation. |
| `frontend/src/app/auth/login` | Modified | Update redirect logic on successful admin login. |
| `frontend/src/app/admin/dashboard` | New | Admin dashboard components, filters, and export actions. |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Match percentage calculation could be slow for large datasets | Med | Optimize DB queries and ensure appropriate indexes on skills and postulation tables. |
| Export functionality complexity | Low | Use standard, well-supported libraries (e.g., exceljs, pdfmake) and handle export generation efficiently. |

## Rollback Plan

- Revert the PR.
- Remove the seeded admin user from the database manually if necessary.

## Dependencies

- Appropriate libraries for Excel and PDF generation.

## Success Criteria

- [ ] Admin user can successfully log in and is redirected to the Admin Dashboard.
- [ ] The dashboard displays total active job offers, total accepted candidates, and match percentage.
- [ ] The metrics can be filtered by "30 days", "1 year", and "all time" (toda la vida).
- [ ] Empty states display "Todavía no hay datos" when metrics are 0.
- [ ] The dashboard can be exported to Excel or PDF correctly containing the filtered data.
</Proposal: admin-reportes-dashboard>
