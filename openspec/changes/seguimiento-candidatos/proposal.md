<Proposal: seguimiento-candidatos>
## Intent

Enable companies to track the progress of candidates applied to their opportunities directly from the frontend candidate list. This improves the company's workflow by allowing state updates (e.g., in process, interviewed, accepted) while ensuring vacancy limits are respected and candidates are automatically notified of their progress.

## Scope

### In Scope
- Add `en_proceso` and `entrevistado` states to the `estados_postulaciones` table.
- Create a new backend endpoint (e.g., `PATCH /empresas/postulaciones/:id/estado`) to update the application state.
- Update the frontend candidate list to include a dropdown for directly changing the candidate's state.
- Implement a backend validation to block accepting a candidate if the `vacantes` limit for that opportunity has been reached.
- Create a notification system to insert a record into the `notificaciones` table for the candidate when their state changes.

### Out of Scope
- Automated state transitions (e.g., automatic rejection of others when vacancies are filled).
- Email or SMS notifications (only in-app database notifications are included).
- Modifying the candidate portal UI beyond displaying the state.

## Capabilities

> This section is the CONTRACT between proposal and specs phases.
> The sdd-spec agent reads this to know exactly which spec files to create or update.
> Research `openspec/specs/` before filling this in.

### New Capabilities
<!-- Capabilities being introduced. Each becomes a new `openspec/specs/<name>/spec.md`.
     Use kebab-case names (e.g., user-auth, data-export, api-rate-limiting).
     Leave empty if no new capabilities. -->
- `postulacion-tracking`: Manage candidate application states, enforce vacancy limits upon acceptance, and trigger candidate notifications on state changes.

### Modified Capabilities
<!-- Existing capabilities whose REQUIREMENTS are changing (not just implementation).
     Only list here if spec-level behavior changes. Each needs a delta spec.
     Use existing spec names from openspec/specs/. Leave empty if none. -->
None

## Approach

We will extend the existing `estados_postulaciones` table via a database migration. A new REST endpoint in the backend will handle state updates, which will include a transaction to verify the current vacancy count for the related opportunity if the new state implies acceptance. Upon successful state update, a service layer logic will create a new entry in the `notificaciones` table for the candidate. The frontend will be updated to display a state dropdown in the candidate list, mapping to the new endpoint and handling any "vacancies full" error responses gracefully.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `backend/db/migrations` | New | Migration for new states |
| `backend/src/routes/postulaciones` | Modified | Add `PATCH` endpoint for state updates |
| `backend/src/services/postulaciones` | Modified | Add state transition logic, vacancy checks, and notification creation |
| `frontend/src/components/CandidateList` | Modified | Add state dropdown and handle backend errors |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Concurrency when updating state to 'accepted' | Med | Use database transactions and row-level locks when checking vacancy limits. |
| Inconsistent states in frontend after update | Low | Re-fetch or optimally update the list state upon successful API response. |

## Rollback Plan

Revert the backend and frontend code to the previous commit. For the DB, state changes to the new states will need to be manually mapped back to previous valid states if a full rollback of the migration is required.

## Dependencies

- Existing `vacantes` count logic for opportunities.
- Existing `notificaciones` table structure.

## Success Criteria

- [ ] Companies can successfully update a candidate's state to `en_proceso` or `entrevistado`.
- [ ] Attempting to accept a candidate when vacancies are filled results in a clear error and the state remains unchanged.
- [ ] Candidates receive a record in the `notificaciones` table when their application state is modified.
