</Delta for admin-dashboard>
<admin-dashboard Specification>
## Purpose

Provides a dashboard for the Admin role to display key job placement metrics, allowing visibility into platform performance with time-based filtering.

## Requirements

### Requirement: Admin Access and Routing

The system MUST allow authenticated Admin users to view the dashboard and SHALL redirect them to the dashboard upon successful login.

#### Scenario: Admin login redirect
- GIVEN an admin user is authenticated successfully
- WHEN the system processes the login routing
- THEN the admin user MUST be redirected to the admin dashboard instead of `/empresas/solicitudes`

#### Scenario: Unauthorized access attempt
- GIVEN a non-admin user
- WHEN the user attempts to access the admin dashboard route
- THEN the system MUST deny access and redirect to an appropriate fallback page or show an error

### Requirement: Metric Display

The dashboard MUST display the total active job offers, total accepted candidates, and the match percentage between candidate skills and vacancy required skills.

#### Scenario: Metrics load successfully
- GIVEN the admin dashboard is requested
- WHEN the page loads
- THEN it MUST display the total active job offers, total accepted candidates, and the match percentage

#### Scenario: Empty states for metrics
- GIVEN the admin dashboard is requested
- WHEN there is no data for a metric (value is 0)
- THEN the UI MUST display the empty state message "Todavía no hay datos"

### Requirement: Time Filtering

The dashboard MUST support filtering metrics by specific time ranges: 30 days, 1 year, and all time.

#### Scenario: Applying a time filter
- GIVEN the admin is viewing the dashboard
- WHEN the admin selects the "30 days" filter
- THEN the displayed metrics MUST update to reflect data from only the last 30 days
- AND the same behavior applies for "1 year" and "all time" filters

</admin-dashboard Specification>
