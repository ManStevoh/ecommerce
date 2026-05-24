import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@nexora/database';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { MfaService } from '../mfa/mfa.service';
import { Role } from '../common/enums/role.enum';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  AuthUserDto,
} from './dto/auth-response.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

const BCRYPT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly redis: RedisService,
    private readonly mfa: MfaService,
  ) {}

  async register(
    dto: RegisterDto,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    const isStoreRegistration = Boolean(dto.storeName?.trim());
    const role = isStoreRegistration ? UserRole.STORE_OWNER : UserRole.CUSTOMER;

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role,
      },
    });

    if (isStoreRegistration && dto.storeName) {
      await this.provisionTenant(user.id, dto.storeName);
    }

    return this.issueTokens(user.id, meta);
  }

  async login(
    dto: LoginDto,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user?.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.mfaEnabled) {
      if (!dto.mfaCode) {
        throw new UnauthorizedException('MFA code required');
      }
      await this.mfa.verify(user.id, dto.mfaCode);
    }

    return this.issueTokens(user.id, meta);
  }

  async refresh(
    userId: string,
    tokenId: string,
    refreshToken: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    await this.prisma.refreshToken.update({
      where: { id: tokenId },
      data: { revokedAt: new Date() },
    });

    const stored = await this.prisma.refreshToken.findFirst({
      where: { id: tokenId, token: refreshToken },
    });
    if (!stored) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.issueTokens(userId, meta);
  }

  async logout(userId: string, sessionId?: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    if (sessionId) {
      await this.redis.deleteSession(sessionId);
      await this.prisma.session.deleteMany({
        where: { userId, redisKey: sessionId },
      });
    }
  }

  async signInOAuthUser(
    profile: {
      email: string;
      firstName?: string | null;
      lastName?: string | null;
    },
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const email = profile.email.toLowerCase();
    let user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      const passwordHash = await bcrypt.hash(uuidv4(), BCRYPT_ROUNDS);
      user = await this.prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName: profile.firstName ?? null,
          lastName: profile.lastName ?? null,
          emailVerified: true,
        },
      });
    } else if (!user.isActive) {
      throw new UnauthorizedException('Account disabled');
    }

    return this.issueTokens(user.id, meta);
  }

  private async issueTokens(
    userId: string,
    meta?: { ip?: string; userAgent?: string },
  ): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    const sessionId = uuidv4();
    const tokenId = uuidv4();
    const refreshExpiresIn =
      this.config.get<string>('jwt.refreshExpiresIn') ?? '7d';
    const accessExpiresIn =
      this.config.get<string>('jwt.accessExpiresIn') ?? '15m';

    const refreshExpiresAt = this.parseExpiry(refreshExpiresIn);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role as Role,
      tenantId: user.tenantId,
      sessionId,
    };

    const refreshTokenJwt = await this.jwt.signAsync(
      { ...payload, tokenId },
      {
        secret: this.config.get<string>('jwt.refreshSecret'),
        expiresIn: refreshExpiresIn,
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        id: tokenId,
        token: refreshTokenJwt,
        userId: user.id,
        expiresAt: refreshExpiresAt,
      },
    });

    await this.prisma.session.create({
      data: {
        userId: user.id,
        redisKey: sessionId,
        ipAddress: meta?.ip,
        userAgent: meta?.userAgent,
        expiresAt: refreshExpiresAt,
      },
    });

    await this.redis.setSession(sessionId, {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    });

    const tokens = await this.generateAccessToken(payload, accessExpiresIn);

    return {
      user: this.toAuthUser(user),
      accessToken: tokens.accessToken,
      refreshToken: refreshTokenJwt,
      expiresIn: accessExpiresIn,
      tokenType: 'Bearer' as const,
    };
  }

  private async generateAccessToken(
    payload: JwtPayload,
    expiresIn: string,
  ): Promise<{ accessToken: string }> {
    const accessToken = await this.jwt.signAsync(payload, {
      secret: this.config.get<string>('jwt.accessSecret'),
      expiresIn,
    });
    return { accessToken };
  }

  private toAuthUser(user: {
    id: string;
    email: string;
    role: string;
    tenantId: string | null;
    firstName: string | null;
    lastName: string | null;
  }): AuthUserDto {
    return {
      id: user.id,
      email: user.email,
      role: user.role as Role,
      tenantId: user.tenantId,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const value = parseInt(match[1], 10);
    const unit = match[2];
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return new Date(Date.now() + value * (multipliers[unit] ?? multipliers.d));
  }

  private async provisionTenant(
    ownerId: string,
    storeName: string,
  ): Promise<void> {
    const tenantServiceUrl = this.config.get<string>('tenantServiceUrl');
    try {
      const response = await fetch(
        `${tenantServiceUrl}/api/v1/tenants/internal/provision`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Api-Key':
              this.config.get<string>('internalApiKey') ?? '',
          },
          body: JSON.stringify({ ownerId, storeName }),
        },
      );
      if (!response.ok) {
        this.logger.warn(
          `Tenant provisioning failed: ${response.status} ${await response.text()}`,
        );
        return;
      }
      const data = (await response.json()) as { tenantId: string };
      await this.prisma.user.update({
        where: { id: ownerId },
        data: { tenantId: data.tenantId },
      });
    } catch (err) {
      this.logger.warn(
        `Tenant service unavailable during registration: ${(err as Error).message}`,
      );
    }
  }
}
