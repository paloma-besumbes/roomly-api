# Roomly API

Backend REST API for managing meeting room reservations, built with
NestJS, TypeScript and PostgreSQL.

Roomly focuses on backend business rules such as preventing overlapping reservations, validating room capacity, handling authenticated users,
and enforcing ownership/admin permissions when cancelling reservations.

## 🔗 Roomly

- **Live Demo:** [Roomly Web](https://roomly-web-red.vercel.app/)
- **API Documentation:** [Swagger UI](https://roomly-api-yzel.onrender.com/api/docs)
- **Frontend Repository:** [roomly-web](https://github.com/paloma-besumbes/roomly-web)

The Live Demo is the complete Roomly application. The frontend communicates with this API to handle authentication, room management and reservations.

### Live Demo

A demo account is available for testing the deployed application:

Email: `john@example.com`
Password: `secret123`

You can use these credentials with the login endpoint or Swagger UI.

## About

Roomly is a portfolio project designed to demonstrate practical backend
development with NestJS and PostgreSQL.

The API is organized around four main modules:

- **Users** --- user registration and authenticated profiles
- **Auth** --- JWT-based authentication
- **Rooms** --- room creation and filtered room search
- **Reservations** --- reservation creation, conflict detection,
  personal reservations and cancellation permissions

The original technical specification also planned availability
calculations, administrative room blocks and a larger role-based
management layer. Those features are part of the project's roadmap but
are not currently implemented in this API version.

## Features

### Authentication

- User registration
- JWT login
- Password hashing with bcrypt
- Authenticated user profile
- JWT-protected endpoints

### Rooms

- Create rooms
- List rooms
- Filter rooms by minimum capacity
- Filter rooms by projector availability
- Filter rooms by whiteboard availability

### Reservations

- Create reservations for a room
- Validate that the user and room exist
- Prevent overlapping reservations for the same room
- Retrieve the authenticated user's reservations
- Cancel reservations
- Allow owners to cancel their own reservations
- Allow administrators to cancel any reservation

### Validation and API documentation

- DTO validation with `class-validator`
- Global validation with whitelist and non-whitelisted property
  rejection
- Swagger / OpenAPI documentation
- Bearer JWT authentication documented in Swagger

## Tech stack

### Backend

- Node.js
- TypeScript
- NestJS
- TypeORM
- PostgreSQL
- Passport
- Passport JWT
- bcrypt

### Validation and documentation

- class-validator
- class-transformer
- Swagger / OpenAPI

### Testing

- Jest
- Supertest
- ts-jest

### Development infrastructure

- Docker Compose
- PostgreSQL 16
- Git / GitHub

## Architecture

The application follows a modular NestJS structure:

`Controller → Service → TypeORM Repository → PostgreSQL`

### Controllers

Controllers expose the HTTP API, receive DTOs and authenticated-user
information, and delegate business operations to services.

### Services

Services contain the main application logic, including:

- user creation and password hashing
- authentication
- room filtering
- reservation validation
- reservation conflict detection
- reservation ownership and administrator permissions

### Entities

TypeORM entities represent the PostgreSQL data model.

### DTOs

DTOs define and validate the data accepted by the API.

### Mappers

User and reservation mappers convert database entities into API response
objects without exposing user passwords.

## Project structure

    src/
    ├── app.module.ts
    ├── main.ts
    ├── auth/
    │   ├── dto/
    │   ├── guards/
    │   ├── interfaces/
    │   ├── strategies/
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   └── auth.module.ts
    ├── users/
    │   ├── dto/
    │   ├── entities/
    │   ├── mappers/
    │   ├── users.controller.ts
    │   ├── users.service.ts
    │   └── users.module.ts
    ├── rooms/
    │   ├── dto/
    │   ├── room.entity.ts
    │   ├── rooms.controller.ts
    │   ├── rooms.service.ts
    │   └── rooms.module.ts
    └── reservations/
        ├── dto/
        ├── entities/
        ├── mappers/
        ├── reservations.controller.ts
        ├── reservations.service.ts
        └── reservations.module.ts

    test/
    ├── factories/
    │   ├── user.factory.ts
    │   ├── room.factory.ts
    │   └── reservation.factory.ts
    ├── app.e2e-spec.ts
    └── jest-e2e.json

## Data model

The current implementation contains three main persisted entities:

### User

A registered application user.

Main fields:

- `id`
- `email`
- `password`
- `firstName`
- `lastName`
- `role`
- `createdAt`
- `updatedAt`

Roles:

- `USER`
- `ADMIN`

Passwords are hashed with bcrypt before being stored.

### Room

A reservable meeting room.

Main fields:

- `id`
- `name`
- `description`
- `capacity`
- `hasProjector`
- `hasWhiteboard`
- `createdAt`

### Reservation

A reservation linking a user to a room and a time interval.

Main fields:

- `id`
- `startTime`
- `endTime`
- `room`
- `user`
- `createdAt`

Reservations use eager relations for their associated room and user, and
response mapping removes the user's password from API responses.

## API

The application uses `/api` as its global API prefix.

### Authentication

#### Register

`POST /api/users`

Creates a new user.

The password is hashed before persistence and the response excludes the
password.

#### Login

`POST /api/auth/login`

Returns a JWT access token.

Example request:

`{"email":"john@example.com","password":"secret123"}`

Example response:

`{"accessToken":"<jwt>"}`

### Users

#### Get current user

`GET /api/users/me`

Requires a valid JWT.

Returns the authenticated user's profile.

#### List users

`GET /api/users`

Requires a valid JWT.

Returns the users currently stored by the application.

### Rooms

#### List rooms

`GET /api/rooms`

Returns rooms and supports optional filters:

- `capacity`
- `hasProjector`
- `hasWhiteboard`

The capacity filter returns rooms whose capacity is greater than or
equal to the requested value.

Examples:

`GET /api/rooms?capacity=6`

`GET /api/rooms?capacity=6&hasProjector=true&hasWhiteboard=true`

#### Create room

`POST /api/rooms`

Creates a room.

The current controller does not apply JWT protection to room creation,
so this endpoint should not be described as admin-only in the current
implementation.

### Reservations

#### Create reservation

`POST /api/reservations`

Requires a valid JWT.

The authenticated user's ID is taken from the JWT rather than the
request body.

The service verifies:

- the user exists
- the room exists
- the requested time interval does not overlap another reservation for
  the same room

The overlap rule is:

`existing.startTime < requested.endTime AND existing.endTime > requested.startTime`

This means a reservation from 10:00 to 11:00 conflicts with one from
10:30 to 11:30, but not with one starting exactly at 11:00.

#### Get my reservations

`GET /api/reservations/me`

Requires a valid JWT.

Returns the authenticated user's reservations ordered by start time.

#### Cancel reservation

`DELETE /api/reservations/:id`

Requires a valid JWT.

The current implementation allows:

- the reservation owner to cancel their reservation
- an `ADMIN` user to cancel any reservation

Other authenticated users receive a forbidden response.

## HTTP error handling

The API uses standard NestJS HTTP exceptions for common business cases.

Examples include:

- `400 Bad Request` --- invalid input or an existing user email
- `401 Unauthorized` --- invalid login credentials or missing/invalid
  authentication
- `403 Forbidden` --- authenticated user does not have permission to
  cancel a reservation
- `404 Not Found` --- requested user, room or reservation does not
  exist

## Business rules currently implemented

The current codebase implements the following core reservation rules:

- User email must be unique.
- Passwords are hashed before persistence.
- Only authenticated users can create reservations.
- The referenced user must exist.
- The referenced room must exist.
- A room cannot have two overlapping reservations.
- Reservations that end exactly when another begins do not overlap.
- Users can cancel their own reservations.
- Administrators can cancel reservations belonging to other users.

The broader technical specification contains additional planned rules
such as preventing past reservations, validating `endTime > startTime`,
checking room capacity during reservation creation, room
activation/deactivation and administrative room blocks. Those rules are
not currently implemented in the reviewed code and are therefore not
presented as current functionality.

## Testing

The project uses Jest and Supertest.

Unit tests cover the main controllers and services for:

- Users
- Authentication
- Rooms
- Reservations

The reservation tests include scenarios such as:

- missing users
- missing rooms
- overlapping reservations
- successful reservation creation
- retrieving personal reservations
- reservation ownership
- administrator cancellation permissions

The repository also contains an E2E testing configuration using Jest,
ts-jest and Supertest. The current E2E spec is still the basic NestJS
root-endpoint test, so broader end-to-end coverage remains a future
improvement.

### Run tests

`npm test`

### Watch mode

`npm run test:watch`

### Coverage

`npm run test:cov`

### E2E tests

`npm run test:e2e`

## Local development

### Requirements

- Node.js
- npm
- Docker Desktop

PostgreSQL can be started locally with the provided Docker Compose
configuration.

### 1. Start PostgreSQL

From the project root:

`docker compose up -d`

The Compose configuration starts:

- PostgreSQL 16
- container name: `roomly_postgres`
- database: `roomly_db`
- host port: `5433`
- PostgreSQL container port: `5432`

Data is persisted through the `roomly_postgres_data` Docker volume.

### 2. Configure environment variables

Create a local `.env` file with the variables expected by the
application.

The current `AppModule` reads the database username from
`DATABASE_USERNAME`.

Example:

    PORT=3000
    DATABASE_HOST=localhost
    DATABASE_PORT=5433
    DATABASE_USERNAME=postgres
    DATABASE_PASSWORD=postgres
    DATABASE_NAME=roomly_db
    JWT_SECRET=change-this-secret

Do not commit real secrets to Git.

### 3. Install dependencies

`npm install`

### 4. Run the API

Development mode:

`npm run start:dev`

The API will be available at:

`http://localhost:3000/api`

Swagger:

`http://localhost:3000/api/docs`

### Production build

`npm run build`

Then:

`npm run start:prod`

## Available scripts

Script Description

---

`npm run build` Builds the NestJS application
`npm run start` Starts the application
`npm run start:dev` Starts the application in watch mode
`npm run start:debug` Starts the application in debug/watch mode
`npm run start:prod` Runs the compiled application
`npm run lint` Runs ESLint
`npm run format` Formats source and test files with Prettier
`npm test` Runs Jest tests
`npm run test:watch` Runs Jest in watch mode
`npm run test:cov` Generates test coverage
`npm run test:debug` Runs Jest with the Node inspector
`npm run test:e2e` Runs the configured E2E test suite

## Swagger / OpenAPI

Swagger UI is available at:

`https://roomly-api-yzel.onrender.com/api/docs`

The API documentation includes bearer authentication, allowing
JWT-protected endpoints to be tested directly from Swagger UI.

To authenticate, obtain an access token through the login endpoint and
use it as the bearer token in Swagger.

## Deployment

The backend is deployed as a NestJS application on Render and uses a
PostgreSQL database hosted on Render.

Production API:

`https://roomly-api-yzel.onrender.com`

The application reads configuration from environment variables,
including database connection settings, `PORT`, `FRONTEND_URL` and the
JWT secret.

The application listens on `0.0.0.0` and uses the configured `PORT`
value.

## Technical decisions

### PostgreSQL as the source of truth

Roomly uses PostgreSQL as its persistent data store and TypeORM as the
ORM.

### Business logic in services

Controllers remain focused on HTTP concerns while reservation rules and
permission checks are handled by services.

### JWT authentication

JWTs are used to authenticate requests to protected endpoints. Passport
and `passport-jwt` provide the authentication strategy used by NestJS.

### Password hashing

Passwords are hashed with bcrypt before being persisted.

### Swagger documentation

The API is documented with Swagger/OpenAPI so that endpoints and
authentication can be explored interactively.

### Docker for local database infrastructure

Docker Compose is used to provide PostgreSQL consistently during local
development. The NestJS application itself is not containerized in the
current version.

## Roadmap

The original Roomly technical specification defines a broader roadmap.

### V1 --- Backend foundation

Current project:

- JWT authentication
- Users
- Rooms
- Reservations
- Reservation conflict detection
- Role-aware reservation cancellation
- Validation
- Unit tests
- Swagger/OpenAPI
- Docker Compose PostgreSQL setup
- Deployment

### Future backend improvements

- Stronger reservation input/business validation
- Room activation/deactivation
- Capacity validation during reservation creation
- Administrative room blocks
- Availability calculation
- Expanded role-based access control
- Broader E2E test coverage
- Environment validation
- More comprehensive API tests

### V2 --- React frontend

Planned:

- Login and registration
- User dashboard
- Date and people selectors
- Calendar-based availability
- Room selection
- Reservation confirmation
- My reservations
- Basic administration UI

### V3 --- Integrations

Potential future additions:

- Google Calendar synchronization
- Email confirmations
- Notifications
- Reservation export
- More advanced administration

## Related project

Roomly is a full-stack portfolio project split into two repositories:

- **Roomly API** --- NestJS backend
- **Roomly Web** --- React frontend

The frontend consumes this API to provide the user-facing reservation
experience.

## License

This project is a personal portfolio project.
