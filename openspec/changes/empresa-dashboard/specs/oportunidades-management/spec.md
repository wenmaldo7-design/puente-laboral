<oportunidades-management Specification>
## Purpose

This specification defines the backend requirements for managing opportunities (e.g., job offers, mentorships, courses) created by an Empresa. It enables creating, reading, updating, and deleting (CRUD) these services so they can be presented as cards in the dashboard.

## Requirements

### Requirement: List Opportunities

The system MUST provide an endpoint (`GET /empresas/ofertas-laborales` or equivalent for services) that retrieves a list of all opportunities created by the authenticated company.

#### Scenario: Company has active opportunities

- GIVEN the company is authenticated and has existing opportunities
- WHEN they request their list of opportunities
- THEN the system returns the opportunities with details needed for dashboard cards (title, modality, status, created date)

#### Scenario: Company has no opportunities

- GIVEN the company has no opportunities
- WHEN they request their list of opportunities
- THEN the system returns an empty list to support the Empty State in the frontend

### Requirement: Create Opportunity

The system MUST provide an endpoint (`POST /empresas/ofertas-laborales`) to create a new opportunity for the company.

#### Scenario: Valid opportunity creation

- GIVEN the company provides valid opportunity details
- WHEN they submit the creation request
- THEN the system creates the opportunity in the database
- AND associates it with the authenticated company's ID

### Requirement: Update Opportunity

The system MUST provide an endpoint (`PUT /empresas/ofertas-laborales/:id` or `PATCH`) to update an existing opportunity owned by the company.

#### Scenario: Valid opportunity update

- GIVEN the company provides valid updated details for an existing opportunity they own
- WHEN they submit the update request
- THEN the system updates the opportunity
- AND returns the updated data

#### Scenario: Unauthorized update attempt

- GIVEN the company attempts to update an opportunity belonging to another company
- WHEN they submit the update request
- THEN the system denies the request with a 403 Forbidden or 404 Not Found

### Requirement: Delete Opportunity

The system MUST provide an endpoint (`DELETE /empresas/ofertas-laborales/:id`) to remove an opportunity.

#### Scenario: Opportunity deletion without candidates

- GIVEN the company requests to delete an opportunity that has no candidates
- WHEN they submit the deletion request
- THEN the system removes or soft-deletes the opportunity successfully

#### Scenario: Opportunity deletion with active candidates

- GIVEN the company requests to delete an opportunity that has active applicants
- WHEN they submit the deletion request
- THEN the system SHOULD return a confirmation warning or soft-delete the opportunity while preserving candidate historical records
