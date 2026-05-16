import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        console.log(
          'DATABASE_USERNAME:',
          configService.get<string>('DATABASE_USERNAME'),
        );

        return {
          type: 'postgres',

          host: configService.get<string>('DATABASE_HOST'),

          port: configService.get<number>('DATABASE_PORT'),

          username: configService.get<string>('DATABASE_USERNAME'),

          password: configService.get<string>('DATABASE_PASSWORD'),

          database: configService.get<string>('DATABASE_NAME'),

          autoLoadEntities: true,

          synchronize: true,
        };
      },
    }),

    UsersModule,

    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
