</Delta for admin-auth-seed>
<admin-auth-seed Specification>
## Purpose

Ensures the existence of a default Admin user in the database to enable administrative access and dashboard usage.

## Requirements

### Requirement: Admin User Seed

The system MUST provide a database seed script that creates a default administrative user in the appropriate tables.

#### Scenario: Running the database seed
- GIVEN an empty or unseeded database
- WHEN the database seed script is executed
- THEN a default admin user MUST be inserted into the `usuarios` table
- AND a corresponding entry MUST be created in the `administradores` table

#### Scenario: Running seed on existing database
- GIVEN a database that already contains the default admin user
- WHEN the database seed script is executed
- THEN the system SHOULD gracefully handle the existing user without duplicating records or throwing an error

</admin-auth-seed Specification>
