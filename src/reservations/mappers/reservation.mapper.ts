import { Reservation } from '../entities/reservation.entity';
import { ReservationResponseDto } from '../dto/reservation-response.dto';

export class ReservationMapper {
  static toResponseDto(reservation: Reservation): ReservationResponseDto {
    return {
      id: reservation.id,

      startTime: reservation.startTime,

      endTime: reservation.endTime,

      createdAt: reservation.createdAt,

      room: {
        id: reservation.room.id,
        name: reservation.room.name,
        description: reservation.room.description,
        capacity: reservation.room.capacity,
        hasProjector: reservation.room.hasProjector,
        hasWhiteboard: reservation.room.hasWhiteboard,
      },

      user: {
        id: reservation.user.id,
        email: reservation.user.email,
        firstName: reservation.user.firstName,
        lastName: reservation.user.lastName,
        role: reservation.user.role,
      },
    };
  }
}
