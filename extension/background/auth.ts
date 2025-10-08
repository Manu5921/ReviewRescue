import { AuthError, UserSession } from '../lib/types';
import { sessionService } from './storage';

// Google Auth Service Interface
export interface IGoogleAuthService {
  authenticate(): Promise<string>;
  getAccessToken(): Promise<string>;
  refreshAccessToken(): Promise<string>;
  logout(): Promise<void>;
  isAuthenticated(): Promise<boolean>;
}

// Google OAuth Service Implementation
export class GoogleAuthService implements IGoogleAuthService {
  private static readonly SCOPES = [
    'https://www.googleapis.com/auth/business.manage',
    'https://www.googleapis.com/auth/userinfo.email',
  ];

  async authenticate(): Promise<string> {
    try {
      const token = await chrome.identity.getAuthToken({
        interactive: true,
        scopes: GoogleAuthService.SCOPES,
      });

      if (!token) {
        throw new AuthError('Authentication failed - no token received', 'AUTH_FAILED');
      }

      // Store session
      const session: UserSession = {
        user_id: await this.getUserId(token),
        email: await this.getUserEmail(token),
        access_token: token,
        token_expires_at: this.calculateTokenExpiry(),
        is_authenticated: true,
      };

      await sessionService.setSession(session);

      return token;
    } catch (error: any) {
      if (error.message?.includes('OAuth2')) {
        throw new AuthError('Google OAuth authentication failed', 'AUTH_FAILED');
      }
      if (error.message?.includes('permission')) {
        throw new AuthError('Permission denied by user', 'PERMISSION_DENIED');
      }
      throw new AuthError(
        error.message || 'Unknown authentication error',
        'UNKNOWN'
      );
    }
  }

  async getAccessToken(): Promise<string> {
    const session = await sessionService.getSession();

    if (!session || !session.access_token) {
      throw new AuthError('No active session - please authenticate', 'AUTH_FAILED');
    }

    // Check if token is expired
    if (session.token_expires_at) {
      const expiresAt = new Date(session.token_expires_at);
      const now = new Date();
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

      // Refresh if token expires in less than 5 minutes
      if (minutesUntilExpiry < 5) {
        return await this.refreshAccessToken();
      }
    }

    return session.access_token;
  }

  async refreshAccessToken(): Promise<string> {
    try {
      // Remove cached token to force refresh
      const session = await sessionService.getSession();
      if (session?.access_token) {
        await chrome.identity.removeCachedAuthToken({ token: session.access_token });
      }

      // Get new token
      const token = await chrome.identity.getAuthToken({
        interactive: false,
        scopes: GoogleAuthService.SCOPES,
      });

      if (!token) {
        throw new AuthError('Token refresh failed', 'TOKEN_EXPIRED');
      }

      // Update session
      await sessionService.updateSession({
        access_token: token,
        token_expires_at: this.calculateTokenExpiry(),
      });

      return token;
    } catch (error: any) {
      if (error.message?.includes('expired') || error.message?.includes('revoked')) {
        throw new AuthError('Token expired - please re-authenticate', 'TOKEN_EXPIRED');
      }
      throw new AuthError(
        error.message || 'Token refresh failed',
        'UNKNOWN'
      );
    }
  }

  async logout(): Promise<void> {
    try {
      const session = await sessionService.getSession();

      // Revoke token
      if (session?.access_token) {
        await chrome.identity.removeCachedAuthToken({ token: session.access_token });

        // Revoke token on Google's servers
        await fetch(
          `https://accounts.google.com/o/oauth2/revoke?token=${session.access_token}`,
          { method: 'POST' }
        );
      }

      // Clear session
      await sessionService.clearSession();
    } catch (error: any) {
      // Even if revocation fails, clear local session
      await sessionService.clearSession();
      console.error('Logout error:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    return await sessionService.isAuthenticated();
  }

  // Helper methods

  private calculateTokenExpiry(): string {
    // Google tokens typically expire in 1 hour
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 1);
    return expiryDate.toISOString();
  }

  private async getUserId(token: string): Promise<string> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.id || 'unknown';
    } catch {
      return 'unknown';
    }
  }

  private async getUserEmail(token: string): Promise<string | undefined> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      return data.email;
    } catch {
      return undefined;
    }
  }
}

// Export singleton instance
export const googleAuthService = new GoogleAuthService();
