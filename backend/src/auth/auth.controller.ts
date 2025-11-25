import { Controller, Post, Body, Get, Put, UseGuards, Request } from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from '../users/users.service';
import { UpdateProfileDto } from '../users/dto/update-profile.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 attempts per minute
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login(@Body() loginDto: LoginDto) {
    try {
      return await this.authService.login(loginDto);
    } catch (error) {
      throw error;
    }
  }

  @Post('refresh')
  @Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 attempts per minute
  async refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshAccessToken(refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async logout(@Request() req, @Body('refreshToken') refreshToken: string) {
    await this.authService.logout(req.user.userId, refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle() // Skip throttling for authenticated requests
  async getProfile(@CurrentUser() user: { userId: string; email: string }) {
    const userDetails = await this.usersService.findById(user.userId);
    return {
      id: userDetails._id,
      email: userDetails.email,
      name: userDetails.name,
      phone: userDetails.phone,
      profileImage: userDetails.profileImage,
      dailyQuota: userDetails.dailyQuota,
      usedQuotaToday: userDetails.usedQuotaToday,
      quotaResetDate: userDetails.quotaResetDate,
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  @SkipThrottle()
  async updateProfile(
    @CurrentUser() user: { userId: string; email: string },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.userId, updateProfileDto);
    return {
      id: updatedUser._id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      profileImage: updatedUser.profileImage,
      dailyQuota: updatedUser.dailyQuota,
      usedQuotaToday: updatedUser.usedQuotaToday,
      quotaResetDate: updatedUser.quotaResetDate,
    };
  }
}
