import { ApiProperty } from '@nestjs/swagger';

export class CloudAccount {
  @ApiProperty({ description: 'Unique identifier for the cloud account', example: 1 })
  id: number = 0;

  @ApiProperty({ description: 'Name of the cloud account', example: 'AWS Account' })
  name: string = '';

  @ApiProperty({ description: 'Type of the cloud account', example: 'AWS' })
  type: string = '';

  @ApiProperty({ description: 'Date when the cloud account was created', example: '2025-08-19T12:34:56Z' })
  createdAt: Date = new Date();

  @ApiProperty({ description: 'Date when the cloud account was last updated', example: '2025-08-19T12:34:56Z' })
  updatedAt: Date = new Date();
}

