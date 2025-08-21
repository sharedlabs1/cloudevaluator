import { ApiProperty } from '@nestjs/swagger';

export class User {
  @ApiProperty({ description: 'Unique identifier for the user', example: 1 })
  id: number = 0;

  @ApiProperty({ description: 'Email address of the user', example: 'user@example.com' })
  email: string = '';

  @ApiProperty({ description: 'Username of the user', example: 'john_doe' })
  username: string = '';

  @ApiProperty({ description: 'Role of the user', example: 'student' })
  role: string = '';

  @ApiProperty({ description: 'Date when the user was created', example: '2025-08-19T12:34:56Z' })
  createdAt: Date = new Date();

  @ApiProperty({ description: 'Date when the user was last updated', example: '2025-08-19T12:34:56Z' })
  updatedAt: Date = new Date();

  // Replace query with a mock implementation
  static async count(): Promise<number> {
    return 100; // Mocked count value
  }
}

