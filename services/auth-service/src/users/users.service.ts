import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRole } from '@nexora/database';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        tenantId: true,
        firstName: true,
        lastName: true,
        mfaEnabled: true,
        isActive: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return { ...user, role: user.role as Role };
  }

  async updateRole(userId: string, role: Role) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { role: role as UserRole },
      select: { id: true, email: true, role: true },
    });
    return { ...user, role: user.role as Role };
  }
}
