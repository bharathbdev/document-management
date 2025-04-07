import { IngestionTask } from '../entities/ingestion-task.entity';
import { User } from '../entities/user.entity';
import { IngestionInput } from 'src/types/ingestion.type';

export interface IIngestionTaskRepository {
  createTask(id: number, status: string, ingestionInput: IngestionInput, user: User): Promise<IngestionTask>;
  updateTaskStatus(id: number, status: string): Promise<IngestionTask>;
  findTaskById(id: number): Promise<IngestionTask>;
}
