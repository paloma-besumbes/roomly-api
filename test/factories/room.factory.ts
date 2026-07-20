import { Room } from '../../src/rooms/room.entity';

export function createMockRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: 'room-1',
    name: 'Meeting Room A',
    description: 'Large meeting room',
    capacity: 8,
    hasProjector: true,
    hasWhiteboard: true,
    createdAt: new Date(),

    ...overrides,
  };
}
