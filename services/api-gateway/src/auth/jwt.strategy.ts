import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '@nexora/shared-types';
import { GatewayConfigService } from '../config/gateway-config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: GatewayConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.jwtSecret,
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    return {
      sub: payload.sub,
      email: payload.email,
      tenantId: payload.tenantId,
      role: payload.role,
      iat: payload.iat,
      exp: payload.exp,
    };
  }
}
