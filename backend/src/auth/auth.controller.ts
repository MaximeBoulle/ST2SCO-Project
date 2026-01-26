import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Res,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { LoginDto, RegisterDto, RequestWithUser } from './auth.types';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDto) {
    try {
      return await this.authService.register(body);
    } catch (error) {
      // VULNERABLE: User enumeration - reveals if username exists
      if (error instanceof Error && error.message === 'Username already taken') {
        throw new ConflictException('Username already taken');
      }
      throw error;
    }
  }

  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const result = await this.authService.validateUser(
      body.username,
      body.password,
    );

    // VULNERABLE: User enumeration - exposes specific error messages
    if (!result.user) {
      throw new UnauthorizedException(result.error);
    }

    const { access_token } = this.authService.login(result.user);

    response.cookie('Authentication', access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 3600000, // 1 hour
    });

    return { message: 'Login successful', user: result.user };
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: express.Response) {
    response.clearCookie('Authentication');
    return { message: 'Logout successful' };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: RequestWithUser) {
    return req.user;
  }
}
