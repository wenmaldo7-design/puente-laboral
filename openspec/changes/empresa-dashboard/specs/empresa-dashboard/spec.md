<empresa-dashboard Specification>
## Purpose

This specification defines the backend requirements and frontend-backend contracts for the main Empresa Dashboard, focusing on retrieving aggregated metrics and recent candidate applications for the company.

## Requirements

### Requirement: Get Dashboard Metrics

The system MUST provide an endpoint (`GET /empresas/metricas`) that returns aggregated metrics for the authenticated company.

#### Scenario: Company requests metrics successfully

- GIVEN the company is authenticated
- WHEN they request their dashboard metrics
- THEN the system returns the total active opportunities, total received candidates, and new candidates

#### Scenario: Company has no active opportunities or candidates

- GIVEN the company has no opportunities or candidates created
- WHEN they request their dashboard metrics
- THEN the system returns zeroes for all aggregated metrics

### Requirement: Get Recent Candidates

The system MUST provide an endpoint (`GET /empresas/postulaciones/recientes`) that returns a short list of the most recent candidate applications across all opportunities owned by the company.

#### Scenario: Company has recent applicants

- GIVEN the company has opportunities with recent applications
- WHEN they request recent candidates
- THEN the system returns a chronologically sorted list of the most recent candidates, including their names, opportunity applied to, and current status

#### Scenario: Company has no applicants

- GIVEN the company has no candidates applied to any opportunity
- WHEN they request recent candidates
- THEN the system returns an empty list
