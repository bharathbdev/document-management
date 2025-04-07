import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ControllersModule } from './controllers/controllers.module';
import { ServicesModule } from './services/services.module';
import { User } from './database/entities/user.entity';
import { Role } from './database/entities/role.entity';
import { Document } from './database/entities/document.entity';
import { IngestionTask } from './database/entities/ingestion-task.entity';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule } from '@nestjs/cache-manager';
import { fetchSecrets, Secrets } from './secret-manager/aws-secret-manager';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secretName = process.env.SECRET_NAME || 'local';
        let url = '';

        if (secretName !== 'local') {
          const secrets: Secrets = await fetchSecrets(secretName);
          url = `postgresql://${secrets.username}:${secrets.password}@${secrets.url}:5432/postgres?schema=public`;
        } else {
          url = configService.get<string>('DATABASE_URL') || 'postgresql://postgres:postgres@localhost:5432/postgres?schema=public';
        }
        return {
          type: 'postgres' as const,
          url,
          entities: [User, Role, Document, IngestionTask],
          synchronize: false,
          logging: true,
        };
      },
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        let password: string = '';
        const secretName = process.env.SECRET_NAME || 'local';

        if (secretName !== 'local') {
          const secrets: Secrets = await fetchSecrets(secretName);
          password = secrets.redistoken || '';
        }
        return {
          store: redisStore,
          host: process.env.REDIS_HOST,
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: password,
          ttl: 180,
        };
      },
    }),
    ControllersModule,
    ServicesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
