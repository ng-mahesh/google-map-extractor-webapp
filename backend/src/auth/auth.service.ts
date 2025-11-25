import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshToken } from './schemas/refresh-token.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    @InjectModel(RefreshToken.name) private refreshTokenModel: Model<RefreshToken>,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.usersService.create({
      ...registerDto,
      password: hashedPassword,
    });

    const tokens = await this.generateTokenPair(user._id.toString(), user.email);

    return {
      ...tokens,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokenPair(user._id.toString(), user.email);

    return {
      ...tokens,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        dailyQuota: user.dailyQuota,
        usedQuotaToday: user.usedQuotaToday,
      },
    };
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    await this.refreshTokenModel.updateOne(
      { userId, token: refreshToken, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async refreshAccessToken(refreshToken: string) {
    // Find the refresh token
    const tokenDoc = await this.refreshTokenModel.findOne({
      token: refreshToken,
      isRevoked: false,
    });

    if (!tokenDoc) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenDoc.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new token pair
    const user = await this.usersService.findById(tokenDoc.userId.toString());
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Revoke old refresh token (token rotation)
    tokenDoc.isRevoked = true;
    tokenDoc.revokedAt = new Date();

    const newTokens = await this.generateTokenPair(user._id.toString(), user.email);

    tokenDoc.replacedByToken = newTokens.refreshToken;
    await tokenDoc.save();

    return newTokens;
  }

  private async generateTokenPair(userId: string, email: string) {
    const payload = { email, sub: userId };

    // Short-lived access token (15 minutes)
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    // Long-lived refresh token (7 days)
    const refreshToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store refresh token in database
    await this.refreshTokenModel.create({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  async validateUser(email: string, password: string): Promise<Omit<any, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _password, ...result } = user.toObject();
      void _password; // Explicitly mark as intentionally unused
      return result;
    }
    return null;
  }
}
