import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ServicesModule } from '../services/services.module';
import { DocumentController } from './document/document.controller';
import { IngestionController } from './ingestionTask/ingestionTask.controller';

@Module({
  imports: [ServicesModule],
  controllers: [AuthController, DocumentController, IngestionController],
})
export class ControllersModule {}
