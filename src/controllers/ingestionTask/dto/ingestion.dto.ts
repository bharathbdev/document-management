import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { STATUS } from 'src/constants/status.enum';

export class TriggerIngestionDto {
  @ApiProperty({ description: 'The data to be ingested' })
  @IsString()
  @IsNotEmpty({ message: 'Data is required' })
  data: string;
}

export class CallbackDto {
  @ApiProperty({ description: 'The ID of the ingestion task' })
  @IsNumber()
  @IsNotEmpty({ message: 'ID is required' })
  id: number;

  @ApiProperty({
    description: 'The status of the ingestion task',
    enum: STATUS,
  })
  @IsEnum(STATUS, {
    message: `Status must be one of: ${Object.values(STATUS).join(', ')}`,
  })
  @IsNotEmpty({ message: 'Status is required' })
  status: string;
}
