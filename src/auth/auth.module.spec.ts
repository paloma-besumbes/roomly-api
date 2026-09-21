import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';

import { UsersModule } from '../users/users.module';
import { UsersService } from '../users/users.service';
import { AuthModule } from './auth.module';

@Module({
  providers: [{ provide: UsersService, useValue: {} }],
  exports: [UsersService],
})
class TestUsersModule {}

describe('AuthModule JWT configuration', () => {
  it.each([
    { expiresIn: '1d', expectedSeconds: 86400 },
    { expiresIn: undefined, expectedSeconds: 3600 },
  ])(
    'issues tokens lasting $expectedSeconds seconds when JWT_EXPIRES_IN is $expiresIn',
    async ({ expiresIn, expectedSeconds }) => {
      const config: Record<string, string | undefined> = {
        JWT_SECRET: 'test-secret',
        JWT_EXPIRES_IN: expiresIn,
      };
      const module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
          AuthModule,
        ],
      })
        .overrideModule(UsersModule)
        .useModule(TestUsersModule)
        .overrideProvider(ConfigService)
        .useValue({ get: (key: string) => config[key] })
        .compile();

      try {
        const jwtService = module.get(JwtService);
        const subject = '550e8400-e29b-41d4-a716-446655440000';
        const token = await jwtService.signAsync({ sub: subject });
        const payload = await jwtService.verifyAsync<{
          sub: string;
          iat: number;
          exp: number;
        }>(token);

        expect(payload.sub).toBe(subject);
        expect(payload.exp - payload.iat).toBe(expectedSeconds);
        await expect(
          jwtService.verifyAsync(token, { clockTimestamp: payload.exp }),
        ).rejects.toThrow('jwt expired');
      } finally {
        await module.close();
      }
    },
  );
});
