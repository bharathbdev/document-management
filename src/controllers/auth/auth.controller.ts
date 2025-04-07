import { Controller, Post, Body, UseGuards, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { AuthService } from '../../services/auth.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { RolesGuard } from '../../guards/roles.guard';
import { Roles } from '../../decorators/roles.decorator';
import { ApiTags, ApiOperation, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddRoleDto, CreateRoleDto, LoginDto, RegisterDto } from './dto/auth.dto';
import { LoginResponse } from 'src/types/auth.type';
import { User } from 'src/database/entities/user.entity';
import { Role } from 'src/database/entities/role.entity';

@ApiTags('Auth')
@ApiBearerAuth('token')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login a user', operationId: 'login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    const user = await this.authService.login(loginDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user', operationId: 'register' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Registration failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async register(@Body() registerDto: RegisterDto): Promise<User> {
    const user = await this.authService.register(registerDto);
    if (!user) {
      throw new HttpException('Registration failed', HttpStatus.BAD_REQUEST);
    }
    return user;
  }

  @Post('add-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Add a role to a user', operationId: 'addUserRole' })
  @ApiBody({ type: AddRoleDto })
  @ApiResponse({
    status: 200,
    description: 'Role added successfully',
    type: User,
  })
  @ApiResponse({ status: 404, description: 'User or role not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async addUserRole(@Body() addRoleDto: AddRoleDto): Promise<User> {
    const result = await this.authService.addUserRole(addRoleDto);
    if (!result) {
      throw new NotFoundException('User or role not found');
    }
    return result;
  }

  @Post('create-role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: 'Create a new role', operationId: 'createRole' })
  @ApiBody({ type: CreateRoleDto })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully',
    type: Role,
  })
  @ApiResponse({ status: 400, description: 'Failed to create role' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createRole(@Body() createRoleDto: CreateRoleDto): Promise<Role> {
    const result = await this.authService.createRole(createRoleDto);
    if (!result) {
      throw new NotFoundException('User or role not found');
    }
    return result;
  }
}
