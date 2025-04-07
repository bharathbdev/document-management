import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RepositoriesModule } from '../database/repositories/repositories.module';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../guards/jwt.strategy';
import { DocumentService } from './document.service';
import { IngestionService } from './ingestionTask.service';
import { RedisService } from './redis.service';
import { S3Service } from './s3.service';

@Module({
  imports: [
    RepositoriesModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecretkey',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, DocumentService, IngestionService, RedisService, S3Service, JwtStrategy],
  exports: [AuthService, DocumentService, IngestionService, RedisService, S3Service, JwtModule],
})
export class ServicesModule {}
