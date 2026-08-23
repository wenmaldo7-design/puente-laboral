</Delta for course-management>
<course-management Specification>
## Purpose

Provides functionality for organizations to create new courses directly from their home screen.

## Requirements

### Requirement: Create Course Action

The system MUST allow users with the Organization role to initiate course creation from their home screen.

#### Scenario: Home screen displays create button

- GIVEN the user is logged in with the Organization role
- WHEN the user navigates to the home screen
- THEN the system MUST display a "Crear curso" (Create course) button

#### Scenario: Initiating course creation

- GIVEN the user is logged in with the Organization role
- WHEN the user clicks the "Crear curso" button
- THEN the system MUST open the course creation flow/form
