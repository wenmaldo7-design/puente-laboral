# service-location Specification

## Purpose

Support for defining and displaying the geographical location (province) of services (Job Offers and Mentorships), including dynamic mandatory rules based on modality and filtering capabilities.

## Requirements

### Requirement: Location Capture in Forms

The system MUST allow users to select a province from a predefined dropdown list of 24 Argentine provinces when creating or editing a Job Offer or Mentorship.

#### Scenario: Creating a service with required location

- GIVEN the user is creating or editing a service
- AND the selected modality is "Presencial" or "Híbrida"
- WHEN the user submits the form
- THEN the province dropdown MUST be mandatory and require a valid selection

#### Scenario: Creating a remote service

- GIVEN the user is creating or editing a service
- AND the selected modality is "Virtual/Remota"
- WHEN the user views the form
- THEN the province dropdown SHOULD be optional or hidden

### Requirement: Location Display

The system MUST display the selected location on the detail view of the Job Offer or Mentorship if a location was provided.

#### Scenario: Viewing a service with a location

- GIVEN a service exists with a specific province assigned
- WHEN a user views the detail page for that service
- THEN the assigned province MUST be displayed in the service information section

### Requirement: Location Filtering

The system MUST allow users to filter the list of services by province.

#### Scenario: Filtering services by province

- GIVEN the user is on the service search or listing page
- WHEN the user selects a specific province in the location filter
- THEN the system MUST display only the services that match the selected province
