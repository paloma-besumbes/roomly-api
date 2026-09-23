import { ValidateBy } from 'class-validator';

export const RESERVATION_DATE_TIME_PATTERN =
  /^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;

export const RESERVATION_DATE_TIME_FORMAT =
  'a valid ISO 8601 date-time (YYYY-MM-DDTHH:mm:ss, optional 1–3 fractional-second digits, and Z or ±HH:mm)';

export function parseReservationDateTime(value: unknown): Date | null {
  if (typeof value !== 'string' || !RESERVATION_DATE_TIME_PATTERN.test(value)) {
    return null;
  }

  // Check the written calendar date in UTC, independently of its time offset.
  // This catches dates that JavaScript would silently roll into another month.
  const calendarDate = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (
    !Number.isFinite(calendarDate.getTime()) ||
    calendarDate.toISOString().slice(0, 10) !== value.slice(0, 10)
  ) {
    return null;
  }

  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function IsReservationDateTime(): PropertyDecorator {
  return ValidateBy({
    name: 'isReservationDateTime',
    validator: {
      validate: (value: unknown) => parseReservationDateTime(value) !== null,
      defaultMessage: () => `$property must be ${RESERVATION_DATE_TIME_FORMAT}`,
    },
  });
}
