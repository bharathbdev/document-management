import { Controller, Post, Get, Body, Param, Req, UseGuards, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { IngestionService } from '../../services/ingestionTask.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { STATUS } from 'src/constants/status.enum';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CallbackDto, TriggerIngestionDto } from './dto/ingestion.dto';
import { IngestionTask } from 'src/database/entities/ingestion-task.entity';

@ApiTags('Ingestion')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Post('trigger')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({
    summary: 'Trigger an ingestion task',
    operationId: 'triggerIngestion',
  })
  @ApiBody({ type: TriggerIngestionDto })
  @ApiResponse({
    status: 201,
    description: 'Ingestion task triggered successfully',
    type: IngestionTask,
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Failed to trigger ingestion' })
  async triggerIngestion(@Body() ingestionInput: TriggerIngestionDto, @Req() req: any): Promise<IngestionTask> {
    const user = req.user; // Extract the authenticated user from the request
    try {
      return await this.ingestionService.triggerIngestion(ingestionInput, user);
    } catch (error) {
      throw new HttpException(error.message || 'Failed to trigger ingestion', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('status/:id')
  @ApiOperation({
    summary: 'Get the status of an ingestion task',
    operationId: 'getIngestionStatus',
  })
  @ApiParam({ name: 'id', description: 'The ID of the ingestion task' })
  @ApiResponse({
    status: 200,
    description: 'Ingestion task status retrieved successfully',
    schema: { example: { id: 123, status: 'COMPLETED' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Ingestion task not found' })
  @ApiResponse({ status: 500, description: 'Failed to fetch ingestion status' })
  async getIngestionStatus(@Param('id') id: number): Promise<{ id: number; status: string }> {
    try {
      const status = await this.ingestionService.getIngestionStatus(id);
      if (!status) {
        throw new NotFoundException('Ingestion task not found');
      }
      return status;
    } catch (error) {
      throw new HttpException(error.message || 'Failed to fetch ingestion status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('callback')
  @ApiOperation({
    summary: 'Handle ingestion callback',
    operationId: 'handleCallback',
  })
  @ApiBody({ schema: { example: { id: 123, status: 'COMPLETED' } } })
  @ApiResponse({
    status: 201,
    description: 'Callback handled successfully',
    schema: { example: { message: 'Callback received successfully' } },
  })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Failed to handle callback' })
  async handleCallback(@Body() payload: CallbackDto): Promise<{ message: string }> {
    try {
      const result = await this.ingestionService.handleCallback(payload);
      const { message, ...rest } = result;
      return { message: 'Callback received successfully', ...rest };
    } catch (error) {
      throw new HttpException(error.message || 'Failed to handle callback', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
