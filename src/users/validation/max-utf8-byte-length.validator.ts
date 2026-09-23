import { Buffer } from 'node:buffer';
import { ValidateBy } from 'class-validator';

export function MaxUtf8ByteLength(maxBytes: number): PropertyDecorator {
  return ValidateBy({
    name: 'maxUtf8ByteLength',
    validator: {
      validate: (value: unknown) =>
        typeof value === 'string' &&
        Buffer.byteLength(value, 'utf8') <= maxBytes,
      defaultMessage: () =>
        `$property must not exceed ${maxBytes} bytes in UTF-8`,
    },
  });
}
