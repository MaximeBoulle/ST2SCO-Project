import {
  Controller,
  Post,
  UseGuards,
  Request,
  Body,
  Get,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CsrfGuard } from './csrf.guard';
import type { LoginDto, RegisterDto, RequestWithUser } from './auth.types';
import * as express from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @UseGuards(CsrfGuard)
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('login')
  @UseGuards(CsrfGuard)
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) response: express.Response,
  ) {
    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const { access_token } = this.authService.login(user);

    // FIX: CSRF - SameSite=Strict prevents cross-site cookie sending
    response.cookie('Authentication', access_token, {
      httpOnly: true,
      path: '/',
      maxAge: 3600000, // 1 hour
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
    });

    return { message: 'Login successful', user };
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
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
