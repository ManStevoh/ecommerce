import { Body, Controller, Delete, Post, UseGuards } from '@nestjs/common';
import { MfaService } from './mfa.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { VerifyMfaDto } from './dto/verify-mfa.dto';

@Controller('auth/mfa')
@UseGuards(JwtAuthGuard)
export class MfaController {
  constructor(private readonly mfaService: MfaService) {}

  @Post('setup')
  setup(@CurrentUser() user: JwtPayload) {
    return this.mfaService.setup(user.sub);
  }

  @Post('enable')
  enable(@CurrentUser() user: JwtPayload, @Body() dto: VerifyMfaDto) {
    return this.mfaService.enable(user.sub, dto.code);
  }

  @Delete('disable')
  disable(@CurrentUser() user: JwtPayload) {
    return this.mfaService.disable(user.sub);
  }

  @Post('verify')
  verify(@CurrentUser() user: JwtPayload, @Body() dto: VerifyMfaDto) {
    return this.mfaService.verify(user.sub, dto.code);
  }
}
