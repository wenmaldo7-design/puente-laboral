</Delta for course-enrollment>
<course-enrollment Specification>
## Purpose

Enables beneficiaries to search, filter, enroll in, and unenroll from courses, while automatically hiding courses that have reached their maximum capacity.

## Requirements

### Requirement: Course Search and Filtering

The system MUST allow beneficiaries to filter the course list by Modality and Province.

#### Scenario: Filtering by Modality and Province

- GIVEN the user is logged in with the Beneficiary role
- WHEN the user selects a specific Modality and Province in the search filters
- THEN the system MUST display only courses matching both selected criteria

#### Scenario: Clearing filters

- GIVEN the user has applied search filters
- WHEN the user clears the filters
- THEN the system MUST display all available courses

### Requirement: Automatic Hiding of Full Courses

The system MUST NOT display courses that have reached their maximum capacity to beneficiaries in the search list.

#### Scenario: Course reaches maximum capacity

- GIVEN a course has no available seats left
- WHEN the beneficiary views the course list
- THEN the system MUST NOT display that course in the list

### Requirement: Course Enrollment

The system MUST allow beneficiaries to enroll in courses that have available capacity.

#### Scenario: Successful enrollment

- GIVEN a course has available capacity
- AND the beneficiary is not already enrolled
- WHEN the beneficiary triggers the enrollment action
- THEN the system MUST register the enrollment
- AND the system MUST update the course status to reflect the successful enrollment

#### Scenario: Enrollment fails due to race condition

- GIVEN a course appears available in the UI but just reached maximum capacity on the backend
- WHEN the beneficiary triggers the enrollment action
- THEN the system MUST display an appropriate error message indicating the course is full

### Requirement: Course Unenrollment

The system MUST allow enrolled beneficiaries to unenroll from a course.

#### Scenario: Successful unenrollment

- GIVEN the beneficiary is currently enrolled in a course
- WHEN the beneficiary triggers the unenrollment action
- THEN the system MUST remove the enrollment
- AND the system MUST update the UI to reflect that the user is no longer enrolled
