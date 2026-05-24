import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';

@Injectable()
export class AttributesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreateAttributeDto) {
    return this.prisma.productAttribute.create({
      data: { ...dto, tenantId: this.tenantContext.getTenantId() },
    });
  }

  async findAll() {
    return this.prisma.productAttribute.findMany({
      where: this.tenantWhere(),
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const attribute = await this.prisma.productAttribute.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!attribute) throw new NotFoundException(`Attribute ${id} not found`);
    return attribute;
  }

  async update(id: string, dto: UpdateAttributeDto) {
    await this.findOne(id);
    return this.prisma.productAttribute.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.productAttribute.delete({ where: { id } });
  }
}
