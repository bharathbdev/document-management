import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'The username of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Username is mandatory' })
  username: string;

  @ApiProperty({ description: 'The password of the user' })
  @IsString()
  @IsNotEmpty({ message: 'Password is mandatory' })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'The username of the new user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'The password of the new user' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class AddRoleDto {
  @ApiProperty({
    description: 'The username of the user to assign the role to',
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'The name of the role to assign' })
  @IsString()
  @IsNotEmpty()
  roleName: string;
}

export class CreateRoleDto {
  @ApiProperty({ description: 'The name of the role to create' })
  @IsString()
  @IsNotEmpty()
  roleName: string;

  @ApiProperty({
    description: 'The permissions associated with the role',
    type: [String],
  })
  @IsArray()
  @IsNotEmpty()
  permissions: string[];
}
