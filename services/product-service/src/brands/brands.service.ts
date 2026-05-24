import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { TenantContextService } from '../common/tenant/tenant-context.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenantContext: TenantContextService,
  ) {}

  private tenantWhere() {
    return { tenantId: this.tenantContext.getTenantId() };
  }

  async create(dto: CreateBrandDto) {
    return this.prisma.brand.create({
      data: { ...dto, tenantId: this.tenantContext.getTenantId() },
    });
  }

  async findAll() {
    return this.prisma.brand.findMany({
      where: this.tenantWhere(),
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const brand = await this.prisma.brand.findFirst({
      where: { id, ...this.tenantWhere() },
    });
    if (!brand) throw new NotFoundException(`Brand ${id} not found`);
    return brand;
  }

  async update(id: string, dto: UpdateBrandDto) {
    await this.findOne(id);
    return this.prisma.brand.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.brand.delete({ where: { id } });
  }
}
