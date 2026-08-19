</Delta for metrics-export>
<metrics-export Specification>
## Purpose

Provides the ability to export the current admin dashboard metrics and reports to external file formats (Excel and PDF).

## Requirements

### Requirement: Export Formats

The system MUST allow administrators to export the dashboard report in both Excel (.xlsx) and PDF formats.

#### Scenario: Exporting to Excel
- GIVEN the admin is viewing the dashboard
- WHEN the admin clicks the export to Excel button
- THEN the system MUST generate and download an Excel file containing the current dashboard data

#### Scenario: Exporting to PDF
- GIVEN the admin is viewing the dashboard
- WHEN the admin clicks the export to PDF button
- THEN the system MUST generate and download a PDF file containing the current dashboard data

### Requirement: Filtered Data Export

The exported file MUST reflect the data corresponding to the currently applied time filter on the dashboard.

#### Scenario: Exporting filtered data
- GIVEN the admin has applied a specific time filter (e.g., "1 year")
- WHEN the admin exports the report
- THEN the exported file MUST only include data and metrics from the filtered time period
- AND the exported document SHOULD indicate the time period it represents

</metrics-export Specification>
