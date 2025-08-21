import { ApiProperty } from '@nestjs/swagger';

export class Batch {
  @ApiProperty({ description: 'Unique identifier for the batch', example: 1 })
  id: number = 0;

  @ApiProperty({ description: 'Name of the batch', example: 'Batch A' })
  name: string = '';

  @ApiProperty({ description: 'Date when the batch was created', example: '2025-08-19T12:34:56Z' })
  createdAt: Date = new Date();

  @ApiProperty({ description: 'Date when the batch was last updated', example: '2025-08-19T12:34:56Z' })
  updatedAt: Date = new Date();

  @ApiProperty({ description: 'Status of the batch', example: 'active', enum: ['active', 'completed', 'archived'], default: 'active' })
  status: string = 'active';

  // Replace query with a mock implementation
  static async count(): Promise<number> {
    return 50; // Mocked count value
  }
}

