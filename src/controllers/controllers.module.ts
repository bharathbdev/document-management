import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ServicesModule } from '../services/services.module';
import { DocumentController } from './document/document.controller';


@Module({
  imports: [ServicesModule],
  controllers: [AuthController, DocumentController],
})
export class ControllersModule { }
