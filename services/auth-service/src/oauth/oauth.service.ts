import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { AuthService } from '../auth/auth.service';

interface GoogleTokenResponse {
  access_token: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified?: boolean;
  given_name?: string;
  family_name?: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class OAuthService {
  private readonly pendingStates = new Map<string, { createdAt: number }>();

  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {}

  getGoogleAuthUrl(): { url: string; state: string } {
    const clientId = this.config.get<string>('oauth.google.clientId');
    const callbackUrl = this.config.get<string>('oauth.google.callbackUrl');

    if (!clientId) {
      throw new BadRequestException(
        'Google OAuth not configured. Set GOOGLE_CLIENT_ID.',
      );
    }

    const state = uuidv4();
    this.pendingStates.set(state, { createdAt: Date.now() });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl!,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
      state,
    };
  }

  async handleGoogleCallback(code: string, state: string) {
    const pending = this.pendingStates.get(state);
    if (!pending) {
      throw new BadRequestException('Invalid or expired OAuth state');
    }
    this.pendingStates.delete(state);

    if (!code) {
      throw new BadRequestException('Missing authorization code');
    }

    const clientId = this.config.get<string>('oauth.google.clientId');
    const clientSecret = this.config.get<string>('oauth.google.clientSecret');
    const callbackUrl = this.config.get<string>('oauth.google.callbackUrl');

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Google OAuth credentials not configured');
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: callbackUrl!,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenRes.ok) {
      throw new UnauthorizedException('Failed to exchange Google OAuth code');
    }

    const tokens = (await tokenRes.json()) as GoogleTokenResponse;

    const profile = await this.fetchGoogleUserInfo(tokens.access_token);
    if (!profile.email) {
      throw new BadRequestException('Google account has no email');
    }

    return this.authService.signInOAuthUser({
      email: profile.email,
      firstName: profile.given_name ?? profile.name?.split(' ')[0],
      lastName: profile.family_name ?? profile.name?.split(' ').slice(1).join(' '),
    });
  }

  async linkGoogleAccount(accessToken: string) {
    const profile = await this.fetchGoogleUserInfo(accessToken);
    if (!profile.email) {
      throw new BadRequestException('Invalid Google access token');
    }

    return {
      linked: true,
      provider: 'google',
      googleId: profile.sub,
      email: profile.email,
      name: profile.name,
      picture: profile.picture,
    };
  }

  private async fetchGoogleUserInfo(
    accessToken: string,
  ): Promise<GoogleUserInfo> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new UnauthorizedException('Failed to fetch Google user profile');
    }

    return res.json() as Promise<GoogleUserInfo>;
  }
}
