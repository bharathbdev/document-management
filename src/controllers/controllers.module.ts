import { Module } from '@nestjs/common';
import { AuthController } from './auth/auth.controller';
import { ServicesModule } from '../services/services.module';


@Module({
  imports: [ServicesModule],
  controllers: [AuthController],
})
export class ControllersModule {}
