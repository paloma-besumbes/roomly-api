import { Reservation } from '../../src/reservations/entities/reservation.entity';

import { createMockRoom } from './room.factory';
import { createMockUser } from './user.factory';

export function createMockReservation(
  overrides: Partial<Reservation> = {},
): Reservation {
  return {
    id: 'reservation-1',
    startTime: new Date('2026-01-01T10:00:00'),
    endTime: new Date('2026-01-01T11:00:00'),
    createdAt: new Date(),

    room: createMockRoom(),

    user: createMockUser(),

    ...overrides,
  };
}
