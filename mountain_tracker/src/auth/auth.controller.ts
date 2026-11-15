import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto } from '../entities.dto.js';
import { JwtAuthGuard } from './guards/jwt-auth.guard.js';
import { AuthenticatedUser } from './strategies/jwt.strategy.js';

// (#15)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // (#15)
  constructor(private readonly authService: AuthService) {}

  // (#15)
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return await this.authService.register(registerDto);
  }

  // (#24)
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  // (#24)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(@Req() req: { user: AuthenticatedUser }) {
    return await this.authService.refresh(req.user);
  }
}
