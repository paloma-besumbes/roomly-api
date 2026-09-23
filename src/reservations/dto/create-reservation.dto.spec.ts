import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateReservationDto } from './create-reservation.dto';

describe('CreateReservationDto date-time validation', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });
  const validBody = {
    roomId: '550e8400-e29b-41d4-a716-446655440000',
    startTime: '2026-08-10T10:00:00Z',
    endTime: '2026-08-10T11:00:00Z',
  };

  describe.each(['startTime', 'endTime'] as const)('%s', (field) => {
    it.each([
      ['UTC seconds', '2026-08-10T10:00:00Z', '2026-08-10T10:00:00.000Z'],
      ['milliseconds', '2026-08-10T10:00:00.123Z', '2026-08-10T10:00:00.123Z'],
      ['tenths', '2026-08-10T10:00:00.1Z', '2026-08-10T10:00:00.100Z'],
      ['hundredths', '2026-08-10T10:00:00.12Z', '2026-08-10T10:00:00.120Z'],
      [
        'positive offset',
        '2026-08-10T12:00:00+02:00',
        '2026-08-10T10:00:00.000Z',
      ],
      [
        'negative offset',
        '2026-08-10T04:30:00-05:30',
        '2026-08-10T10:00:00.000Z',
      ],
      [
        'UTC date rollover',
        '2026-01-01T00:30:00+02:00',
        '2025-12-31T22:30:00.000Z',
      ],
      ['leap day', '2024-02-29T10:00:00Z', '2024-02-29T10:00:00.000Z'],
      ['leap century', '2000-02-29T10:00:00Z', '2000-02-29T10:00:00.000Z'],
    ])(
      'accepts %s without changing the instant',
      async (_label, value, instant) => {
        const dto: unknown = await pipe.transform(
          { ...validBody, [field]: value },
          { type: 'body', metatype: CreateReservationDto },
        );

        expect(dto).toBeInstanceOf(CreateReservationDto);
        if (!(dto instanceof CreateReservationDto)) {
          throw new Error(
            'Expected validation to produce a CreateReservationDto',
          );
        }
        expect(dto[field]).toBe(value);
        expect(new Date(dto[field]).toISOString()).toBe(instant);
      },
    );

    it.each([
      ['date only', '2026-08-10'],
      ['week date', '2026-W33-1'],
      ['week date with time', '2026-W33-1T10:00:00Z'],
      ['ordinal date', '2026-222T10:00:00Z'],
      ['February 30', '2026-02-30T10:00:00Z'],
      ['non-leap day with offset', '2025-02-29T10:00:00+02:00'],
      ['non-leap century', '1900-02-29T10:00:00Z'],
      ['April 31', '2026-04-31T10:00:00Z'],
      ['invalid month', '2026-13-01T10:00:00Z'],
      ['missing timezone', '2026-08-10T10:00:00'],
      ['missing seconds', '2026-08-10T10:00Z'],
      ['space separator', '2026-08-10 10:00:00Z'],
      ['hour rollover', '2026-08-10T24:00:00Z'],
      ['invalid minute', '2026-08-10T10:60:00Z'],
      ['leap second', '2026-08-10T10:00:60Z'],
      ['invalid offset', '2026-08-10T10:00:00+24:00'],
      ['invalid offset minutes', '2026-08-10T10:00:00+02:60'],
      ['sub-millisecond precision', '2026-08-10T10:00:00.1234Z'],
      ['trailing whitespace', '2026-08-10T10:00:00Z\n'],
      ['unparseable text', 'not-a-date'],
      ['empty string', ''],
      ['null', null],
      ['number', 1786356000000],
      ['array', ['2026-08-10T10:00:00Z']],
      ['missing value', undefined],
    ])('rejects %s with a field-specific 400', async (_label, value) => {
      const result = pipe.transform(
        { ...validBody, [field]: value },
        { type: 'body', metatype: CreateReservationDto },
      );

      await expect(result).rejects.toBeInstanceOf(BadRequestException);
      await expect(result).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: [
            expect.stringContaining(
              `${field} must be a valid ISO 8601 date-time`,
            ),
          ],
        },
      });
    });
  });
});
