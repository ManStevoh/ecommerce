import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GatewayConfigModule } from '../config/gateway-config.module';
import { GatewayConfigService } from '../config/gateway-config.service';
import { JwtAuthMiddleware } from './jwt-auth.middleware';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [GatewayConfigModule],
      inject: [GatewayConfigService],
      useFactory: (config: GatewayConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: config.jwtExpiresIn },
      }),
    }),
  ],
  providers: [JwtStrategy, JwtAuthMiddleware],
  exports: [JwtModule, JwtAuthMiddleware],
})
export class AuthModule {}
