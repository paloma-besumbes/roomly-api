Especificación técnica v1 — Roomly API

1. Nombre del proyecto

Roomly API

Backend para gestionar reservas de salas en espacios compartidos, como oficinas, bibliotecas, coworkings, academias o centros de formación.

El proyecto tendrá una primera versión centrada en backend, pero se diseñará desde el principio pensando en una futura interfaz React.

2. Objetivo del proyecto

Roomly API permite a usuarios registrados consultar salas disponibles y reservarlas en una franja horaria concreta. Los administradores pueden gestionar las salas, consultar todas las reservas y bloquear horarios por mantenimiento, limpieza, eventos internos u otros motivos.

El objetivo técnico principal no es crear otro CRUD, sino construir una API con reglas de negocio reales.

La API debe ser capaz de responder preguntas como:

¿Qué salas están disponibles para 6 personas el martes de 10:00 a 11:00?
¿Puede este usuario reservar esta sala en esta franja horaria?
¿Existe ya una reserva o bloqueo administrativo que impida esta reserva?
¿Qué franjas horarias debería pintar el frontend como libres, limitadas o completas?

3. Enfoque profesional del proyecto

Roomly se construirá como un proyecto de portfolio orientado a demostrar competencias de backend y arquitectura básica.

Debe demostrar que sabes trabajar con:

NestJS
TypeScript
PostgreSQL
Docker
JWT
Roles
Validación de datos
Relaciones entre entidades
Reglas de negocio
Consultas de disponibilidad
Tests
README profesional

También debe dejar abierta la puerta a una segunda fase full-stack:

React
Calendario visual
Franjas horarias coloreadas
Selección de sala desde interfaz
Panel de usuario
Panel de administración básico

Pero en la v1 el foco será la API.

4. Problema que resuelve

En muchos espacios compartidos existen varias salas con distinta capacidad. Los usuarios necesitan reservar una sala para una hora concreta, pero el sistema debe evitar errores como:

Reservar una sala ya ocupada.
Reservar una sala bloqueada por mantenimiento.
Reservar una sala demasiado pequeña para el número de personas indicado.
Reservar en el pasado.
Crear reservas con horarios incoherentes.
Cancelar reservas de otros usuarios.
Gestionar salas inactivas como si estuvieran disponibles.

Roomly API centraliza esa lógica y garantiza que las reservas cumplan reglas claras.

5. Alcance de la versión 1

La v1 incluirá:

Autenticación con JWT.
Registro e inicio de sesión.
Roles: admin y user.
Gestión de salas.
Gestión de reservas.
Consulta de disponibilidad.
Bloqueos administrativos de salas.
Validaciones de negocio.
Tests principales.
Docker Compose con PostgreSQL.
README profesional.

La v1 no incluirá todavía:

Frontend React.
Google Calendar.
Emails.
Pagos.
Notificaciones.
WebSockets.
Microservicios.
CQRS.
Panel administrativo avanzado.
Subida de imágenes.
Sistema de organizaciones multiempresa.

Esto último es importante. No lo descartamos para siempre, pero queda fuera del MVP para no convertir el proyecto en un monstruo.

6. Usuarios y roles
   6.1. Usuario normal

El usuario normal puede:

Registrarse.
Iniciar sesión.
Consultar salas activas.
Consultar disponibilidad.
Crear reservas.
Ver sus propias reservas.
Cancelar sus propias reservas.

No puede:

Crear salas.
Editar salas.
Desactivar salas.
Ver todas las reservas del sistema.
Cancelar reservas de otros usuarios.
Crear bloqueos administrativos.
6.2. Administrador

El administrador puede:

Crear salas.
Editar salas.
Desactivar salas.
Ver todas las reservas.
Cancelar cualquier reserva.
Crear bloqueos administrativos.
Eliminar bloqueos administrativos.
Consultar disponibilidad.

El admin representa a la persona que gestiona el espacio físico: responsable de coworking, biblioteca, academia, oficina, etc.

7. Entidades principales

La v1 tendrá cinco entidades principales:

User
Room
Reservation
RoomBlock
AvailabilitySlot

La última, AvailabilitySlot, probablemente no será una tabla real al principio, sino un objeto calculado que la API devuelve para el frontend.

8. Modelo de datos conceptual
   8.1. User

Representa a una persona registrada en la aplicación.

Campos recomendados:

id
name
email
passwordHash
role
createdAt
updatedAt

Ejemplo conceptual:

User {
id: string;
name: string;
email: string;
passwordHash: string;
role: 'admin' | 'user';
createdAt: Date;
updatedAt: Date;
}

Reglas importantes:

El email debe ser único.
La contraseña nunca se guarda en texto plano.
El rol por defecto será user.
Solo debería existir admin si se crea manualmente, mediante seed o mecanismo controlado.
8.2. Room

Representa una sala reservable.

Campos recomendados:

id
name
capacity
location
description
isActive
createdAt
updatedAt

Ejemplo conceptual:

Room {
id: string;
name: string;
capacity: number;
location: string;
description?: string;
isActive: boolean;
createdAt: Date;
updatedAt: Date;
}

Reglas importantes:

La capacidad debe ser mayor que 0.
Solo las salas activas aparecen como reservables para usuarios normales.
Una sala inactiva no puede recibir nuevas reservas.
No eliminaremos salas físicamente al principio; usaremos desactivación.

Esto es mejor para portfolio que borrar salas sin más, porque te permite hablar de soft delete lógico o desactivación funcional.

8.3. Reservation

Representa una reserva hecha por un usuario para una sala concreta y un intervalo de tiempo concreto.

Campos recomendados:

id
userId
roomId
startTime
endTime
peopleCount
status
createdAt
updatedAt
cancelledAt

Ejemplo conceptual:

Reservation {
id: string;
userId: string;
roomId: string;
startTime: Date;
endTime: Date;
peopleCount: number;
status: 'confirmed' | 'cancelled';
createdAt: Date;
updatedAt: Date;
cancelledAt?: Date;
}

En la v1 yo usaría solo dos estados:

confirmed
cancelled

No metería todavía pending, porque eso suele tener sentido si hay pagos, aprobación manual o confirmación externa. Para esta versión, si la reserva supera todas las validaciones, queda confirmada directamente.

Reglas importantes:

No se puede reservar en el pasado.
endTime debe ser posterior a startTime.
peopleCount debe ser mayor que 0.
peopleCount no puede superar la capacidad de la sala.
No puede existir otra reserva confirmada solapada para la misma sala.
No puede existir un bloqueo administrativo solapado para la misma sala.
Un usuario normal solo puede cancelar sus propias reservas.
Un admin puede cancelar cualquier reserva.
Una reserva cancelada no cuenta como conflicto para futuras reservas.
8.4. RoomBlock

Representa un bloqueo administrativo de una sala.

Ejemplos:

Mantenimiento.
Limpieza.
Evento interno.
Sala temporalmente cerrada.
Reparación técnica.

Campos recomendados:

id
roomId
startTime
endTime
reason
createdById
createdAt
updatedAt

Ejemplo conceptual:

RoomBlock {
id: string;
roomId: string;
startTime: Date;
endTime: Date;
reason: string;
createdById: string;
createdAt: Date;
updatedAt: Date;
}

Reglas importantes:

Solo un admin puede crear bloqueos.
Solo un admin puede eliminar bloqueos.
No se puede crear un bloqueo con endTime <= startTime.
No se debería crear un bloqueo en el pasado.
Una sala bloqueada no puede reservarse durante ese intervalo.

Aquí hay una decisión interesante: ¿permitimos crear un bloqueo aunque ya haya reservas en esa franja?

Para la v1, yo recomiendo una regla sencilla:

No se puede crear un bloqueo si ya existen reservas confirmadas en esa franja.

Esto evita tener que gestionar cancelaciones automáticas y notificaciones.

Más adelante podríamos permitir que un admin bloquee una sala aunque haya reservas, pero entonces habría que decidir qué pasa con esas reservas. Para la v1, lo evitamos.

8.5. AvailabilitySlot

No será necesariamente una tabla. Será una respuesta calculada por el backend.

Representa una franja horaria disponible, limitada o completa para una fecha y número de personas.

Ejemplo:

AvailabilitySlot {
startTime: string;
endTime: string;
status: 'available' | 'limited' | 'full';
availableRoomsCount: number;
}

Ejemplo de respuesta:

[
{
"startTime": "2026-05-12T09:00:00.000Z",
"endTime": "2026-05-12T10:00:00.000Z",
"status": "available",
"availableRoomsCount": 4
},
{
"startTime": "2026-05-12T10:00:00.000Z",
"endTime": "2026-05-12T11:00:00.000Z",
"status": "limited",
"availableRoomsCount": 1
},
{
"startTime": "2026-05-12T11:00:00.000Z",
"endTime": "2026-05-12T12:00:00.000Z",
"status": "full",
"availableRoomsCount": 0
}
]

Esto será clave para el futuro frontend React.

9. Relaciones entre entidades

Relaciones principales:

User 1 ──── N Reservation
Room 1 ──── N Reservation
Room 1 ──── N RoomBlock
User 1 ──── N RoomBlock

Explicado en lenguaje natural:

Un usuario puede tener muchas reservas.

Una sala puede tener muchas reservas.

Una sala puede tener muchos bloqueos administrativos.

Un administrador puede haber creado muchos bloqueos.

10. Reglas de negocio v1

Esta es la parte más importante del proyecto.

10.1. Reglas de usuarios
El email debe ser único.
La contraseña debe guardarse hasheada.
El usuario registrado por defecto tendrá rol user.
Solo usuarios autenticados pueden crear reservas.
10.2. Reglas de salas
Solo admin puede crear salas.
Solo admin puede editar salas.
Solo admin puede desactivar salas.
Una sala debe tener capacidad mayor que 0.
Una sala inactiva no se puede reservar.
Los usuarios normales solo ven salas activas.
10.3. Reglas de reservas
Solo usuarios autenticados pueden crear reservas.
No se puede crear una reserva en el pasado.
endTime debe ser posterior a startTime.
peopleCount debe ser mayor que 0.
La sala debe existir.
La sala debe estar activa.
peopleCount no puede superar la capacidad de la sala.
No puede existir una reserva confirmada solapada en la misma sala.
No puede existir un bloqueo administrativo solapado en la misma sala.
Un usuario normal solo puede ver sus propias reservas.
Un usuario normal solo puede cancelar sus propias reservas.
Un admin puede ver todas las reservas.
Un admin puede cancelar cualquier reserva.
Una reserva cancelada no bloquea disponibilidad.
10.4. Regla clave: solapamiento de horarios

Esta será una de las piezas técnicas centrales.

Dos intervalos se solapan si:

existing.startTime < requested.endTime
AND
existing.endTime > requested.startTime

Ejemplo:

Reserva existente:

10:00 - 11:00

Nueva reserva:

10:30 - 11:30

Se solapan.

Nueva reserva:

11:00 - 12:00

No se solapan, porque empieza justo cuando termina la anterior.

Esta regla será importante para reservas y bloqueos.

10.5. Reglas de bloqueos administrativos
Solo admin puede crear bloqueos.
Solo admin puede eliminar bloqueos.
El bloqueo debe pertenecer a una sala existente.
No se puede bloquear una sala inactiva.
endTime debe ser posterior a startTime.
No se puede crear un bloqueo en el pasado.
No se puede crear un bloqueo si ya hay una reserva confirmada solapada.
Una sala bloqueada no aparece como disponible.
10.6. Reglas de disponibilidad

El backend debe poder calcular disponibilidad según:

Fecha.
Hora de inicio.
Hora de fin.
Número de personas.
Capacidad de las salas.
Reservas confirmadas.
Bloqueos administrativos.
Estado activo/inactivo de la sala.

Una sala estará disponible si:

Está activa.
Tiene capacidad suficiente.
No tiene una reserva confirmada solapada.
No tiene un bloqueo administrativo solapado. 11. Endpoints REST v1
11.1. Auth
Registrar usuario
POST /auth/register

Body:

{
"name": "Paloma",
"email": "paloma@example.com",
"password": "Password123!"
}

Respuesta esperada:

{
"id": "uuid",
"name": "Paloma",
"email": "paloma@example.com",
"role": "user"
}

Notas:

No se devuelve passwordHash.
El rol por defecto es user.
Login
POST /auth/login

Body:

{
"email": "paloma@example.com",
"password": "Password123!"
}

Respuesta:

{
"accessToken": "jwt-token",
"user": {
"id": "uuid",
"name": "Paloma",
"email": "paloma@example.com",
"role": "user"
}
}
11.2. Users

En la v1 no necesitamos un módulo enorme de usuarios.

Obtener mi perfil
GET /users/me

Auth:

user
admin

Respuesta:

{
"id": "uuid",
"name": "Paloma",
"email": "paloma@example.com",
"role": "user"
}

No metería todavía endpoints para listar todos los usuarios, editar usuarios o cambiar roles desde API. Eso puede ir a una versión posterior.

11.3. Rooms
Crear sala
POST /rooms

Auth:

admin

Body:

{
"name": "Meeting Room A",
"capacity": 6,
"location": "First floor",
"description": "Room with screen and whiteboard"
}

Respuesta:

{
"id": "uuid",
"name": "Meeting Room A",
"capacity": 6,
"location": "First floor",
"description": "Room with screen and whiteboard",
"isActive": true
}
Listar salas
GET /rooms

Auth:

user
admin

Query params opcionales:

GET /rooms?capacity=6&isActive=true

Para usuarios normales, por defecto devolvería solo salas activas.

Para admin, podríamos permitir ver activas e inactivas.

Respuesta:

[
{
"id": "uuid",
"name": "Meeting Room A",
"capacity": 6,
"location": "First floor",
"isActive": true
}
]
Obtener detalle de una sala
GET /rooms/:id

Auth:

user
admin
Actualizar sala
PATCH /rooms/:id

Auth:

admin

Body posible:

{
"name": "Meeting Room A Updated",
"capacity": 8,
"location": "Second floor",
"description": "Updated description"
}
Desactivar sala
PATCH /rooms/:id/deactivate

Auth:

admin

Regla:

Una sala desactivada no puede reservarse.

De momento no borramos salas físicamente.

Reactivar sala
PATCH /rooms/:id/activate

Auth:

admin

Esto es útil si una sala vuelve a estar disponible.

11.4. Reservations
Crear reserva
POST /reservations

Auth:

user
admin

Body:

{
"roomId": "uuid",
"startTime": "2026-05-12T10:00:00.000Z",
"endTime": "2026-05-12T11:00:00.000Z",
"peopleCount": 4
}

Respuesta:

{
"id": "uuid",
"roomId": "uuid",
"userId": "uuid",
"startTime": "2026-05-12T10:00:00.000Z",
"endTime": "2026-05-12T11:00:00.000Z",
"peopleCount": 4,
"status": "confirmed"
}

Validaciones:

La sala existe.
La sala está activa.
La capacidad es suficiente.
La reserva no está en el pasado.
endTime > startTime.
No hay reservas solapadas.
No hay bloqueos solapados.
Ver mis reservas
GET /reservations/me

Auth:

user
admin

Query params opcionales:

GET /reservations/me?status=confirmed
GET /reservations/me?from=2026-05-01&to=2026-05-31

Respuesta:

[
{
"id": "uuid",
"room": {
"id": "uuid",
"name": "Meeting Room A"
},
"startTime": "2026-05-12T10:00:00.000Z",
"endTime": "2026-05-12T11:00:00.000Z",
"peopleCount": 4,
"status": "confirmed"
}
]
Ver todas las reservas
GET /reservations

Auth:

admin

Query params recomendados:

GET /reservations?status=confirmed
GET /reservations?roomId=uuid
GET /reservations?from=2026-05-01&to=2026-05-31
Obtener una reserva por id
GET /reservations/:id

Auth:

user propietario
admin

Regla:

Un usuario normal solo puede acceder a la reserva si es suya.
Un admin puede acceder a cualquier reserva.
Cancelar reserva
PATCH /reservations/:id/cancel

Auth:

user propietario
admin

Reglas:

Un usuario normal solo puede cancelar sus propias reservas.
Un admin puede cancelar cualquier reserva.
No se puede cancelar dos veces la misma reserva.

Respuesta:

{
"id": "uuid",
"status": "cancelled",
"cancelledAt": "2026-05-10T12:30:00.000Z"
}
11.5. Availability

Este módulo será muy importante porque conecta backend con el futuro React.

Buscar salas disponibles para una franja
GET /availability/rooms?startTime=2026-05-12T10:00:00.000Z&endTime=2026-05-12T11:00:00.000Z&people=4

Auth:

user
admin

Respuesta:

[
{
"id": "uuid",
"name": "Meeting Room A",
"capacity": 6,
"location": "First floor"
},
{
"id": "uuid",
"name": "Meeting Room B",
"capacity": 8,
"location": "Second floor"
}
]

Regla:

Devuelve solo salas activas, con capacidad suficiente y sin reservas ni bloqueos solapados.
Obtener disponibilidad por franjas horarias
GET /availability/calendar?date=2026-05-12&people=4

Auth:

user
admin

Respuesta:

[
{
"startTime": "2026-05-12T09:00:00.000Z",
"endTime": "2026-05-12T10:00:00.000Z",
"status": "available",
"availableRoomsCount": 3
},
{
"startTime": "2026-05-12T10:00:00.000Z",
"endTime": "2026-05-12T11:00:00.000Z",
"status": "limited",
"availableRoomsCount": 1
},
{
"startTime": "2026-05-12T11:00:00.000Z",
"endTime": "2026-05-12T12:00:00.000Z",
"status": "full",
"availableRoomsCount": 0
}
]

Para la v1, propongo una jornada fija:

09:00 a 18:00
Franjas de 1 hora

Esto evita complejidad innecesaria.

Más adelante podríamos permitir horarios configurables por organización o por sala, pero no ahora.

11.6. Room Blocks
Crear bloqueo de sala
POST /rooms/:roomId/blocks

Auth:

admin

Body:

{
"startTime": "2026-05-12T13:00:00.000Z",
"endTime": "2026-05-12T15:00:00.000Z",
"reason": "Maintenance"
}

Reglas:

La sala debe existir.
La sala debe estar activa.
endTime debe ser posterior a startTime.
No debe existir reserva confirmada solapada.
Ver bloqueos de una sala
GET /rooms/:roomId/blocks

Auth:

admin

Query params opcionales:

GET /rooms/:roomId/blocks?from=2026-05-01&to=2026-05-31
Eliminar bloqueo
DELETE /room-blocks/:id

Auth:

admin

En la v1 podemos hacer eliminación física de bloqueos. Si quieres ser más conservadora, podríamos hacer cancelled o deletedAt, pero para no complicar demasiado, borrarlo está bien.

12. Estructura NestJS propuesta

La estructura inicial podría ser:

src/
app.module.ts
main.ts

config/
env.validation.ts

common/
decorators/
current-user.decorator.ts
roles.decorator.ts
guards/
jwt-auth.guard.ts
roles.guard.ts
enums/
user-role.enum.ts
reservation-status.enum.ts
filters/
interceptors/

auth/
auth.module.ts
auth.controller.ts
auth.service.ts
dto/
register.dto.ts
login.dto.ts
strategies/
jwt.strategy.ts

users/
users.module.ts
users.controller.ts
users.service.ts
users.repository.ts
entities/
user.entity.ts

rooms/
rooms.module.ts
rooms.controller.ts
rooms.service.ts
rooms.repository.ts
dto/
create-room.dto.ts
update-room.dto.ts
entities/
room.entity.ts

reservations/
reservations.module.ts
reservations.controller.ts
reservations.service.ts
reservations.repository.ts
dto/
create-reservation.dto.ts
reservation-query.dto.ts
entities/
reservation.entity.ts

availability/
availability.module.ts
availability.controller.ts
availability.service.ts
dto/
availability-query.dto.ts
calendar-availability-query.dto.ts

room-blocks/
room-blocks.module.ts
room-blocks.controller.ts
room-blocks.service.ts
room-blocks.repository.ts
dto/
create-room-block.dto.ts
entities/
room-block.entity.ts 13. Decisión sobre arquitectura

Para esta v1, no vamos a hacer Clean Architecture extrema.

Usaremos una arquitectura típica de Nest:

Controller → Service → Repository/ORM → Database

El reparto será:

Controller:
recibe requests, valida DTOs, llama al servicio.

Service:
contiene reglas de negocio.

Repository:
consulta o persiste datos.

Entity:
representa tablas de base de datos.

DTO:
define los datos que entran en la API.

La parte más importante es que las reglas de negocio estén en servicios, no en controladores.

Por ejemplo, esta lógica no debería vivir en el controller:

Comprobar si la sala está activa.
Comprobar si hay solapamiento.
Comprobar si la capacidad es suficiente.
Comprobar si el usuario puede cancelar.

Eso debe vivir en ReservationsService, AvailabilityService o servicios equivalentes.

14. Base de datos
    14.1. Tablas principales
    users
    rooms
    reservations
    room_blocks
    14.2. Campos orientativos
    users
    id UUID PRIMARY KEY
    name VARCHAR NOT NULL
    email VARCHAR UNIQUE NOT NULL
    password_hash VARCHAR NOT NULL
    role VARCHAR NOT NULL
    created_at TIMESTAMP NOT NULL
    updated_at TIMESTAMP NOT NULL
    rooms
    id UUID PRIMARY KEY
    name VARCHAR NOT NULL
    capacity INTEGER NOT NULL
    location VARCHAR NOT NULL
    description TEXT NULL
    is_active BOOLEAN NOT NULL DEFAULT true
    created_at TIMESTAMP NOT NULL
    updated_at TIMESTAMP NOT NULL
    reservations
    id UUID PRIMARY KEY
    user_id UUID NOT NULL REFERENCES users(id)
    room_id UUID NOT NULL REFERENCES rooms(id)
    start_time TIMESTAMP NOT NULL
    end_time TIMESTAMP NOT NULL
    people_count INTEGER NOT NULL
    status VARCHAR NOT NULL
    created_at TIMESTAMP NOT NULL
    updated_at TIMESTAMP NOT NULL
    cancelled_at TIMESTAMP NULL
    room_blocks
    id UUID PRIMARY KEY
    room_id UUID NOT NULL REFERENCES rooms(id)
    start_time TIMESTAMP NOT NULL
    end_time TIMESTAMP NOT NULL
    reason TEXT NOT NULL
    created_by_id UUID NOT NULL REFERENCES users(id)
    created_at TIMESTAMP NOT NULL
    updated_at TIMESTAMP NOT NULL
15. Validaciones de DTO
    RegisterDto
    name: string obligatorio
    email: email válido
    password: string obligatorio, mínimo razonable
    LoginDto
    email: email válido
    password: string obligatorio
    CreateRoomDto
    name: string obligatorio
    capacity: number mayor que 0
    location: string obligatorio
    description: string opcional
    UpdateRoomDto
    name: string opcional
    capacity: number mayor que 0 opcional
    location: string opcional
    description: string opcional
    CreateReservationDto
    roomId: UUID obligatorio
    startTime: fecha ISO obligatoria
    endTime: fecha ISO obligatoria
    peopleCount: number mayor que 0
    CreateRoomBlockDto
    startTime: fecha ISO obligatoria
    endTime: fecha ISO obligatoria
    reason: string obligatorio
    AvailabilityQueryDto
    startTime: fecha ISO obligatoria
    endTime: fecha ISO obligatoria
    people: number mayor que 0
    CalendarAvailabilityQueryDto
    date: fecha YYYY-MM-DD obligatoria
    people: number mayor que 0
16. Manejo de errores

Usaremos errores HTTP claros.

Ejemplos:

400 Bad Request

Cuando los datos enviados son inválidos.

endTime debe ser posterior a startTime.
peopleCount debe ser mayor que 0.
Formato de fecha inválido.
401 Unauthorized

Cuando el usuario no está autenticado.

Token ausente.
Token inválido.
Token expirado.
403 Forbidden

Cuando el usuario está autenticado, pero no tiene permisos.

Un user intenta crear una sala.
Un user intenta cancelar una reserva de otra persona.
Un user intenta crear un bloqueo administrativo.
404 Not Found

Cuando el recurso no existe.

Sala no encontrada.
Reserva no encontrada.
Bloqueo no encontrado.
409 Conflict

Cuando la petición es válida técnicamente, pero choca con el estado actual del sistema.

La sala ya está reservada en esa franja.
La sala está bloqueada por mantenimiento.
Ya existe un usuario con ese email.

Este código queda muy bien para las reglas de solapamiento, porque expresa que hay un conflicto de negocio.

17. Tests prioritarios

No vamos a testear absolutamente todo desde el día uno. Priorizamos los tests que demuestran valor.

17.1. Tests de auth
Registra un usuario correctamente.
No permite registrar dos usuarios con el mismo email.
Hace login con credenciales válidas.
Rechaza login con contraseña incorrecta.
No devuelve passwordHash en las respuestas.
17.2. Tests de rooms
Admin puede crear una sala.
User no puede crear una sala.
No permite crear sala con capacidad 0.
Lista salas activas.
Admin puede desactivar una sala.
Una sala desactivada no aparece como disponible.
17.3. Tests de reservations
Usuario puede crear una reserva válida.
No permite reservar en el pasado.
No permite endTime <= startTime.
No permite reservar sala inexistente.
No permite reservar sala inactiva.
No permite reservar con peopleCount mayor que capacity.
No permite reserva solapada.
Permite reserva justo después de otra.
Usuario puede cancelar su propia reserva.
Usuario no puede cancelar reserva ajena.
Admin puede cancelar cualquier reserva.
Una reserva cancelada deja de bloquear disponibilidad.
17.4. Tests de room blocks
Admin puede bloquear una sala.
User no puede bloquear una sala.
No permite bloqueo con endTime <= startTime.
No permite bloquear una sala con reservas confirmadas solapadas.
Una sala bloqueada no aparece como disponible.
Admin puede eliminar un bloqueo.
17.5. Tests de availability
Devuelve salas disponibles para una franja.
No devuelve salas sin capacidad suficiente.
No devuelve salas con reservas solapadas.
No devuelve salas con bloqueos solapados.
Devuelve slot como available si hay varias salas libres.
Devuelve slot como limited si queda una sala libre.
Devuelve slot como full si no queda ninguna sala libre. 18. Docker

La v1 deberá poder levantarse con Docker Compose.

Servicios mínimos:

api
postgres

Opcionalmente:

pgadmin

Estructura esperada:

Dockerfile
docker-compose.yml
.env.example

Variables de entorno orientativas:

PORT=3000
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=roomly_db
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

Para desarrollo local sin Docker, DATABASE_HOST podría ser:

localhost

Dentro de Docker Compose, normalmente será:

postgres 19. README final esperado

El README del proyecto debería incluir:

Nombre del proyecto.
Descripción breve.
Problema que resuelve.
Tecnologías usadas.
Principales funcionalidades.
Reglas de negocio.
Modelo de datos resumido.
Endpoints principales.
Cómo ejecutar el proyecto.
Cómo ejecutar tests.
Variables de entorno.
Ejemplos de uso.
Decisiones técnicas.
Roadmap.

Una descripción inicial podría ser:

Roomly API is a backend application built with NestJS, TypeScript and PostgreSQL for managing room bookings in shared spaces. It allows users to book rooms based on date, time and capacity, while administrators can manage rooms and maintenance blocks.

The project focuses on real business rules such as preventing overlapping reservations, validating time ranges, calculating room availability and enforcing role-based permissions. 20. Roadmap completo del proyecto
V1 — Backend API
Auth
Users
Rooms
Reservations
Availability
RoomBlocks
Roles
Tests
Docker
README
V2 — Frontend React
Login/register.
Dashboard de usuario.
Selector de fecha.
Selector de número de personas.
Calendario diario o semanal.
Franjas coloreadas según disponibilidad.
Selección de sala disponible.
Confirmación de reserva.
Página de mis reservas.
Panel admin básico para salas y bloqueos.

Aquí usaríamos React y probablemente una librería visual de calendario, no Google Calendar como base.

V3 — Integraciones
Google Calendar opcional.
Emails de confirmación.
Notificaciones.
Exportación de reservas.
Mejoras de administración.

Google Calendar quedaría como sincronización externa, no como fuente principal de verdad.

21. Decisiones tomadas

Para dejarlo muy claro:

La fuente de verdad será PostgreSQL.
La lógica de disponibilidad vivirá en el backend.
React solo pintará la disponibilidad devuelta por la API.
Google Calendar no forma parte de la v1.
La v1 no tendrá pagos, emails ni notificaciones.
La v1 tendrá solo roles admin y user.
Las reservas serán confirmed o cancelled.
No habrá estado pending en la v1.
Las salas se desactivan, no se borran físicamente.
Los bloqueos administrativos impiden reservas.
No se permite crear bloqueos sobre reservas existentes en la v1.
