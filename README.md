# Roomly API

Roomly API is the backend REST API for Roomly, a full-stack room reservation application built as a portfolio project.

The API handles user authentication, room management and reservations, including reservation conflict detection and ownership-based cancellation permissions.

## 🔗 Roomly

- **Live Demo:** [Roomly Web](https://roomly-web-red.vercel.app/)
- **API Documentation:** [Swagger UI](https://roomly-api-yzel.onrender.com/api/docs)
- **Frontend Repository:** [roomly-web](https://github.com/paloma-besumbes/roomly-web)

The frontend communicates with this API to provide the complete Roomly reservation experience.

### Demo account

A demo account is available for testing the deployed application:

**Email:** `john@example.com`  
**Password:** `secret123`

You can use these credentials in the frontend or with the login endpoint in Swagger UI.

## About the project

Roomly was created to practice and demonstrate backend and full-stack development using a TypeScript-based stack.

The backend is organized around four main modules:

- **Users** — user registration and authenticated profiles
- **Auth** — JWT-based authentication
- **Rooms** — room creation, listing and filtering
- **Reservations** — reservation creation, conflict detection, personal reservations and cancellation permissions

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

### Validation and documentation

- DTO validation with `class-validator`
- Global validation with whitelist and non-whitelisted property rejection
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

### Development and deployment

- Docker Compose
- Git / GitHub
- Render

## Architecture

The application follows a modular NestJS structure:

`Controller → Service → TypeORM Repository → PostgreSQL`

### Controllers

Controllers expose the HTTP API, receive DTOs and authenticated-user information, and delegate business operations to services.

### Services

Services contain the main application logic, including:

- User creation and password hashing
- Authentication
- Room filtering
- Reservation validation
- Reservation conflict detection
- Reservation ownership and administrator permissions

### Entities and DTOs

TypeORM entities represent the PostgreSQL data model. DTOs define and validate the data accepted by the API.

### Mappers

User and reservation mappers convert database entities into API response objects without exposing user passwords.

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

The application contains three main persisted entities:

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

Reservation responses include their associated room and user information while mapping user data so passwords are not exposed.

## API overview

The application uses `/api` as its global API prefix.

| Method | Endpoint | Description | Authentication |
| --- | --- | --- | --- |
| `POST` | `/api/users` | Register a user | No |
| `GET` | `/api/users/me` | Get authenticated user profile | JWT |
| `GET` | `/api/users` | List users | JWT |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT | No |
| `GET` | `/api/rooms` | List and filter rooms | No |
| `POST` | `/api/rooms` | Create a room | No |
| `POST` | `/api/reservations` | Create a reservation | JWT |
| `GET` | `/api/reservations/me` | Get personal reservations | JWT |
| `DELETE` | `/api/reservations/:id` | Cancel a reservation | JWT |

For complete request schemas, responses and interactive endpoint testing, see the [Swagger documentation](https://roomly-api-yzel.onrender.com/api/docs).

### Room filters

`GET /api/rooms` supports optional filters:

- `capacity`
- `hasProjector`
- `hasWhiteboard`

The capacity filter returns rooms whose capacity is greater than or equal to the requested value.

Example:

`GET /api/rooms?capacity=6&hasProjector=true&hasWhiteboard=true`

### Reservation conflict detection

When creating a reservation, the service verifies that the user and room exist and that the requested interval does not overlap another reservation for the same room.

The overlap rule is:

`existing.startTime < requested.endTime AND existing.endTime > requested.startTime`

This allows consecutive reservations: a reservation ending at 11:00 does not conflict with another starting exactly at 11:00.

### Cancellation permissions

A reservation can be cancelled by:

- The user who owns the reservation
- An `ADMIN` user

Other authenticated users receive a forbidden response.

## Testing

The project uses Jest and Supertest.

Unit tests cover the main controllers and services for:

- Users
- Authentication
- Rooms
- Reservations

Reservation tests include scenarios such as missing users or rooms, overlapping reservations, successful creation, personal reservation retrieval, ownership checks and administrator cancellation permissions.

The repository also includes an E2E testing configuration. Broader end-to-end coverage is planned as a future improvement.

### Test commands

```bash
npm test
npm run test:watch
npm run test:cov
npm run test:e2e
```

## Local development

### Requirements

- Node.js
- npm
- Docker Desktop

### 1. Clone the repository

```bash
git clone https://github.com/paloma-besumbes/roomly-api.git
cd roomly-api
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d
```

The Docker Compose configuration starts PostgreSQL locally using host port `5433` and persists data through a Docker volume.

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=roomly_db
JWT_SECRET=change-this-secret
FRONTEND_URL=http://localhost:5173
```

Use your own local credentials and secret values. Do not commit real secrets to Git.

### 4. Run the API

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000/api`.

Swagger UI will be available at `http://localhost:3000/api/docs`.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run build` | Builds the NestJS application |
| `npm run start` | Starts the application |
| `npm run start:dev` | Starts the application in watch mode |
| `npm run start:prod` | Runs the compiled application |
| `npm run lint` | Runs ESLint |
| `npm run format` | Formats source and test files with Prettier |
| `npm test` | Runs Jest tests |
| `npm run test:watch` | Runs Jest in watch mode |
| `npm run test:cov` | Generates test coverage |
| `npm run test:e2e` | Runs the configured E2E test suite |

## Deployment

The backend is deployed on Render and uses a PostgreSQL database hosted on Render.

The application reads its configuration from environment variables, including database connection settings, `PORT`, `FRONTEND_URL` and the JWT secret.

- **Production API:** [roomly-api-yzel.onrender.com](https://roomly-api-yzel.onrender.com)
- **Swagger:** [API Documentation](https://roomly-api-yzel.onrender.com/api/docs)
- **Frontend:** [Roomly Web](https://roomly-web-red.vercel.app/)

## Future improvements

Planned backend improvements include:

- Stronger reservation input and business validation
- Room activation and deactivation
- Capacity validation during reservation creation
- Administrative room blocks
- Availability calculation
- Expanded role-based access control
- Broader E2E test coverage
- Environment validation

## Related project

Roomly is split into two repositories:

- **Roomly API** — this NestJS backend
- **[Roomly Web](https://github.com/paloma-besumbes/roomly-web)** — React frontend

The frontend consumes this API to provide the user-facing reservation experience.

## License

This project was created as a portfolio project.
