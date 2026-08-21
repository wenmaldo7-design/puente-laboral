<candidatos-tracking Specification>
## Purpose

This specification defines the backend requirements for allowing an Empresa to view the candidates who have applied to their specific opportunities, including tracking the current status of each candidate's application.

## Requirements

### Requirement: List Candidates by Opportunity

The system MUST provide an endpoint (e.g., `GET /empresas/ofertas-laborales/:id/candidatos`) that retrieves all candidates who have applied to a specific opportunity.

#### Scenario: Opportunity has multiple candidates

- GIVEN the company is authenticated and owns the opportunity
- WHEN they request the candidates for that opportunity
- THEN the system returns a list of candidates including their basic info (name, email) and current application status

#### Scenario: Opportunity has no candidates

- GIVEN the company owns the opportunity but no one has applied
- WHEN they request the candidates for that opportunity
- THEN the system returns an empty list

#### Scenario: Unauthorized access to candidates

- GIVEN the company attempts to view candidates for an opportunity they do not own
- WHEN they request the candidates
- THEN the system denies the request with a 403 Forbidden or 404 Not Found

### Requirement: View Candidate Status Details

The system SHOULD provide the necessary status badge information (e.g., pending, reviewed, rejected) within the candidate list response.

#### Scenario: Retrieve status badge info

- GIVEN the company views the candidates for an opportunity
- WHEN the candidate data is returned
- THEN each candidate's current state (`estados_postulaciones` or equivalent) is clearly indicated to be rendered in the UI
