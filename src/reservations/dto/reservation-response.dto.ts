export class ReservationResponseDto {
  id!: string;

  startTime!: Date;

  endTime!: Date;

  createdAt!: Date;

  room!: {
    id: string;
    name: string;
    description: string;
    capacity: number;
    hasProjector: boolean;
    hasWhiteboard: boolean;
  };

  user!: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}
