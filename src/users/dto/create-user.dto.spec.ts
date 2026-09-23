import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto password validation', () => {
  const pipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  function validatePassword(password: unknown): Promise<unknown> {
    return pipe.transform(
      {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password,
      },
      { type: 'body', metatype: CreateUserDto },
    );
  }

  it.each([
    ['normal ASCII', 'secret123', 9],
    ['minimum ASCII length', 'a'.repeat(8), 8],
    ['72 ASCII bytes', 'a'.repeat(72), 72],
    ['72 bytes of accented characters', 'é'.repeat(36), 72],
    ['72 bytes of emoji', '😀'.repeat(18), 72],
  ])(
    'accepts %s without altering the password',
    async (_label, password, bytes) => {
      expect(Buffer.byteLength(password, 'utf8')).toBe(bytes);
      const dto = await validatePassword(password);
      expect(dto).toBeInstanceOf(CreateUserDto);
      expect(dto).toEqual({
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password,
      });
    },
  );

  it.each([
    ['73 ASCII bytes', 'a'.repeat(73), 73],
    ['37 accented characters', 'é'.repeat(37), 74],
    ['19 emoji', '😀'.repeat(19), 76],
  ])('rejects %s with a clear 400', async (_label, password, bytes) => {
    expect(Buffer.byteLength(password, 'utf8')).toBe(bytes);
    const result = validatePassword(password);
    await expect(result).rejects.toBeInstanceOf(BadRequestException);
    await expect(result).rejects.toMatchObject({
      response: {
        statusCode: 400,
        error: 'Bad Request',
        message: ['password must not exceed 72 bytes in UTF-8'],
      },
    });
  });

  it.each(['1234567', '😀'.repeat(4)])(
    'preserves the existing minimum character length for %s',
    async (password) => {
      await expect(validatePassword(password)).rejects.toMatchObject({
        response: {
          statusCode: 400,
          message: ['password must be longer than or equal to 8 characters'],
        },
      });
    },
  );

  it.each([null, undefined, 12345678, ['secret123']])(
    'rejects non-string input %p without throwing a parsing error',
    async (password) => {
      await expect(validatePassword(password)).rejects.toBeInstanceOf(
        BadRequestException,
      );
    },
  );
});
