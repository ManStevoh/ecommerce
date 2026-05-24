import { Role } from '../../common/enums/role.enum';

export class AuthUserDto {
  id!: string;
  email!: string;
  role!: Role;
  tenantId?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export class AuthResponseDto {
  user!: AuthUserDto;
  accessToken!: string;
  refreshToken!: string;
  expiresIn!: string;
  tokenType!: 'Bearer';
}
