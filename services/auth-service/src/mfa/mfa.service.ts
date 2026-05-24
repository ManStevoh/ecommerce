import { authenticator } from 'otplib';
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MfaService {
  constructor(private readonly prisma: PrismaService) {}

  async setup(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const secret = authenticator.generateSecret();
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaSecret: secret, mfaEnabled: false },
    });

    const otpauth = authenticator.keyuri(user.email, 'Nexora Commerce', secret);

    return {
      secret,
      qrCodeUrl: otpauth,
      message: 'Scan QR code with your authenticator app',
    };
  }

  async enable(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaSecret) {
      throw new NotFoundException('MFA not initialized. Call setup first.');
    }

    const valid = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!valid) {
      return { enabled: false, message: 'Invalid MFA code' };
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: true },
    });

    return { enabled: true, message: 'MFA enabled' };
  }

  async disable(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { mfaEnabled: false, mfaSecret: null },
    });
    return { enabled: false };
  }

  async verify(userId: string, code: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user?.mfaEnabled || !user.mfaSecret) {
      return { verified: true, mfaRequired: false };
    }

    const verified = authenticator.verify({ token: code, secret: user.mfaSecret });
    if (!verified) {
      throw new UnauthorizedException('Invalid MFA code');
    }

    return { verified: true, mfaRequired: true };
  }
}
