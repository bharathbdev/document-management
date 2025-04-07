import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRepository } from './user.repository';
import { RoleRepository } from './role.repository';
import { Document } from '../entities/document.entity'; // Import Document entity
import { IngestionTask } from '../entities/ingestion-task.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, Document, IngestionTask])],
  providers: [UserRepository, RoleRepository],
  exports: [UserRepository, RoleRepository, TypeOrmModule],
})
export class RepositoriesModule {}
