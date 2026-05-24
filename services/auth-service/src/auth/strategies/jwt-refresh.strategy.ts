import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: JwtPayload & { tokenId: string },
  ): Promise<JwtPayload & { refreshToken: string; tokenId: string }> {
    const refreshToken =
      (req.body as { refreshToken?: string })?.refreshToken ?? '';

    const stored = await this.prisma.refreshToken.findFirst({
      where: {
        id: payload.tokenId,
        token: refreshToken,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      include: { user: true },
    });

    if (!stored?.user?.isActive) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    return {
      sub: stored.user.id,
      email: stored.user.email,
      role: stored.user.role as Role,
      tenantId: stored.user.tenantId,
      refreshToken,
      tokenId: payload.tokenId,
    };
  }
}
