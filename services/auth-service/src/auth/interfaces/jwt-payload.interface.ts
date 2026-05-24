import { Role } from '../../common/enums/role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
  tenantId?: string | null;
  sessionId?: string;
  tokenId?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
  tokenType: 'Bearer';
}
