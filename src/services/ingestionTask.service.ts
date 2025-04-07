import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { IngestionTaskRepository } from '../database/repositories/ingestionTask.repository';
import { RedisService } from '../services/redis.service';
import { User } from '../database/entities/user.entity';
import axios from 'axios';
import { STATUS } from '../constants/status.enum';
import { IngestionInput, IngestionCallbackPayload } from '../types/ingestion.type';
import { IngestionTask } from 'src/database/entities/ingestion-task.entity';
import { generateRandomId } from '../utilities/helper';
@Injectable()
export class IngestionService {
  constructor(
    private readonly ingestionTaskRepository: IngestionTaskRepository,
    private readonly redisService: RedisService,
  ) {}

  async triggerIngestion(ingestionInput: IngestionInput, user: User): Promise<IngestionTask> {
    const callbackUrl = 'http://localhost:3000/ingestion/callback';
    const pythonBackendUrl = 'http://localhost:5000/ingestion/start';

    try {
      // const response = await axios.post(pythonBackendUrl, { ...ingestionInput, callbackUrl });
      const response = {
        data: {
          id: generateRandomId(), // Mocked ID
        },
      };

      const task = await this.ingestionTaskRepository.createTask(response.data.id, STATUS.IN_PROGRESS, ingestionInput, user);

      await this.redisService.set(response.data.id, 'In Progress');

      // Simulate a delayed callback after 20 seconds
      setTimeout(async () => {
        const callbackPayload: IngestionCallbackPayload = {
          id: response.data.id,
          status: STATUS.COMPLETED,
        };

        await axios.post(callbackUrl, callbackPayload);
      }, 20000);

      return task;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to trigger ingestion', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async handleCallback(payload: IngestionCallbackPayload): Promise<{ message: string; task: IngestionTask }> {
    try {
      const { id, status } = payload;

      const task = await this.ingestionTaskRepository.updateTaskStatus(id, status);

      await this.redisService.set(id, status);

      return { message: 'Callback received successfully', task };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to handle callback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getIngestionStatus(id: number): Promise<{ id: number; status: string }> {
    const cachedStatus = await this.redisService.get(id);
    if (cachedStatus) {
      return { id, status: cachedStatus };
    }

    const task = await this.ingestionTaskRepository.findTaskById(id);
    if (!task) {
      throw new NotFoundException('Ingestion task not found');
    }

    await this.redisService.set(id, task.status);

    return { id, status: task.status };
  }
}
