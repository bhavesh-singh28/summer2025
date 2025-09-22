# API Endpoints

This document provides a summary of all the API endpoints in the backend.

## `auth.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| POST | /login | No | Logs in a user. | `{ "email": "user@example.com", "password": "password" }` |
| POST | /signup | No | Signs up a new user. | `{ "name": "Test User", "email": "user@example.com", "password": "password" }` |
| POST | /send-verification-code | No | Sends a verification code to a user's email. | `{ "email": "user@example.com" }` |
| POST | /verify-code | No | Verifies the signup OTP. | `{ "email": "user@example.com", "otp": "123456" }` |
| POST | /resend-code | No | Resends the verification code. | `{ "email": "user@example.com" }` |
| POST | /verify-student-email | No | Verifies a student's email before signup. | `{ "email": "student@example.com" }` |
| GET | /users/me | Yes | Gets the details of the logged-in user. | (None) |

## `canteenStaff.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| GET | / | No | Gets the canteen staff. | (None) |
| PUT | / | No | Updates the canteen staff. | `{ "name": "New Name" }` |

## `expense.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| POST | /add-expense | No | Adds a new expense. | `{ "studentId": "123", "amount": 100, "description": "Lunch" }` |
| GET | /transactions | No | Gets recent expenses. | (None) |
| GET | /transactions/:studentid | No | Gets expenses for a specific student. | (None) |

## `menu.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| GET | /test | No | Test route for menu. | (None) |
| GET | /debug | No | Debug route to see all menus. | (None) |
| GET | /weekly | No | Gets the weekly menu. | (None) |
| GET | /day/:day | No | Gets the menu for a specific day. | (None) |
| POST | / | No | Creates a new menu. | `{ "day": "Monday", "date": "2025-09-08", "meals": [] }` |
| GET | /all | No | Gets all menus. | (None) |
| PUT | /:id | No | Updates a menu. | `{ "day": "Monday", "date": "2025-09-08", "meals": [] }` |
| DELETE | /:id | No | Deletes a menu. | (None) |

## `messStaff.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| GET | /test | No | Test route for mess staff. | (None) |
| GET | /transactions-test | No | Test route for transactions. | (None) |
| GET | / | No | Gets the mess staff. | (None) |
| POST | / | No | Adds new mess staff. | `{ "name": "New Staff", "email": "staff@example.com" }` |
| PUT | /:id | No | Updates mess staff. | `{ "name": "Updated Staff" }` |
| DELETE | /:id | No | Deletes mess staff. | (None) |
| GET | /stats | No | Gets transaction statistics. | (None) |
| POST | /add-expense | Yes | Adds a new expense (mess admin only). | `{ "amount": 50, "description": "Dinner" }` |
| POST | /auth/login | No | Logs in a mess staff. | `{ "email": "staff@example.com", "password": "password" }` |
| GET | /transactions | Yes | Gets mess transactions by role. | (None) |

## `notice.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| GET | / | No | Gets all notices. | (None) |
| POST | / | No | Adds a new notice. | `{ "title": "New Notice", "content": "This is a new notice." }` |

## `personaldetailRoutes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| POST | /insert | No | Inserts personal details. | `{ "studentId": "123", "firstName": "John", "lastName": "Doe" }` |
| GET | /view | No | Lists personal details. | (None) |
| POST | /upload-documents/:studentId | No | Uploads documents for a student. | (Multipart/form-data with `documents` field) |
| PATCH | /verify-documents/:studentId | No | Verifies documents for a student. | `{ "verified": true }` |
| GET | /pending-verifications | No | Gets pending document verifications. | (None) |
| GET | /all-verifications | No | Gets all document verifications. | (None) |

## `qr.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| POST | /scan | No | Scans a QR code and records an expense. | `{ "qrToken": "some-qr-token" }` |
| POST | /refresh-token | Yes | Refreshes a user's QR token. | (None - requires authentication) |

## `stats.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| GET | / | No | Gets statistics. | (None) |

## `student.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| GET | / | No | Gets all students. | (None) |
| GET | /:id | No | Gets a student by ID. | (None) |
| PUT | /:id/verify | No | Verifies a student. | `{ "verified": true }` |
| PUT | /:id/change-password | No | Changes a student's password. | `{ "oldPassword": "old", "newPassword": "new" }` |

## `test.routes.js`

| Method | Path | Protected | Description | Request Body |
|---|---|---|---|---|
| POST | /test-email | No | Tests the email sending functionality. | `{ "email": "test@example.com", "fullName": "Test User" }` |
| GET | /test-password | No | Generates a test password. | (None) |