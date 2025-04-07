import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IngestionTask } from '../entities/ingestion-task.entity';
import { User } from '../entities/user.entity';
import { IngestionInput } from 'src/types/ingestion.type';
import { IIngestionTaskRepository } from '../interfaces/iingestion.repository';

@Injectable()
export class IngestionTaskRepository implements IIngestionTaskRepository {
  constructor(
    @InjectRepository(IngestionTask)
    private readonly ingestionTaskRepository: Repository<IngestionTask>,
  ) {}

  async createTask(id: number, status: string, ingestionInput: IngestionInput, user: User): Promise<IngestionTask> {
    const task = this.ingestionTaskRepository.create({
      id,
      status,
      ingestionInput,
      createdAt: new Date(),
      user,
    });
    return this.ingestionTaskRepository.save(task);
  }

  async updateTaskStatus(id: number, status: string): Promise<IngestionTask> {
    const task = await this.ingestionTaskRepository.findOne({ where: { id } });
    if (task) {
      task.status = status;
      task.updatedAt = new Date();
      return this.ingestionTaskRepository.save(task);
    }
    throw new NotFoundException(`Task with id ${id} not found`);
  }

  async findTaskById(id: number): Promise<IngestionTask> {
    const task = await this.ingestionTaskRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }
    return task;
  }
}
