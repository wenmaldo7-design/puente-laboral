## Purpose

Manage candidate application states, enforce vacancy limits upon acceptance, and trigger candidate notifications on state changes to enable companies to track candidate progress directly.

## Requirements

### Requirement: State Management

The system MUST allow authorized companies to update the state of a candidate's application (e.g., in process, interviewed, accepted).

#### Scenario: Successful state update

- GIVEN a company user is managing a candidate's application
- WHEN the user updates the candidate's state
- THEN the system MUST update the application state
- AND the system MUST reflect the new state for the company user

### Requirement: Vacancy Limit Enforcement

The system MUST prevent a candidate from being accepted if the opportunity's vacancy limit has been reached.

#### Scenario: Acceptance within vacancy limit

- GIVEN an opportunity has at least one remaining vacancy
- WHEN the company updates a candidate's state to accepted
- THEN the system MUST successfully update the state
- AND the system MUST consider the vacancy filled

#### Scenario: Acceptance exceeding vacancy limit

- GIVEN an opportunity has zero remaining vacancies
- WHEN the company attempts to update a candidate's state to accepted
- THEN the system MUST reject the state update
- AND the candidate's state MUST remain unchanged
- AND the system MUST return a validation error

### Requirement: Candidate Notification

The system MUST notify candidates when their application state changes.

#### Scenario: State change triggers notification

- GIVEN a candidate has an active application
- WHEN the company successfully changes the application state
- THEN the system MUST generate an in-app notification for the candidate
- AND the notification MUST communicate the new application state
