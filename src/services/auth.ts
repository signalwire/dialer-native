import { authorize, refresh, AuthorizeResult } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_CONFIG = {
  issuer: 'https://id.fabric.signalwire.com/',
  serviceConfiguration: {
    authorizationEndpoint: 'https://id.fabric.signalwire.com/login/oauth/authorize',
    tokenEndpoint: 'https://id.fabric.signalwire.com/oauth/token',
  },
  clientId: 'lMcMQXRiDbuzI49cSfAkGZ4aoObh99LEu-1HudX5Di4',
  redirectUrl: 'com.dialer://oauth-callback',
  clientAuthMethod: 'post' as const,
  scopes: [],
};

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const TOKEN_EXPIRY_KEY = 'token_expiry';

export async function login(): Promise<AuthorizeResult> {
  try {
    const result = await authorize(AUTH_CONFIG);
    console.log('[AUTH] Login result:', {
      hasAccessToken: !!result.accessToken,
      hasRefreshToken: !!result.refreshToken,
      hasExpiry: !!result.accessTokenExpirationDate,
      expiry: result.accessTokenExpirationDate,
    });
    await saveAuthResult(result);
    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function saveAuthResult(result: AuthorizeResult) {
  console.log('[AUTH] Saving auth result to AsyncStorage');
  await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
  if (result.refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, result.refreshToken);
    console.log('[AUTH] Saved refresh token');
  } else {
    console.log('[AUTH] No refresh token to save');
  }
  if (result.accessTokenExpirationDate) {
    await AsyncStorage.setItem(TOKEN_EXPIRY_KEY, result.accessTokenExpirationDate);
    console.log('[AUTH] Saved expiry:', result.accessTokenExpirationDate);
  } else {
    console.log('[AUTH] No expiry date to save');
  }
}

export async function getToken(): Promise<string | null> {
  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const expiry = await AsyncStorage.getItem(TOKEN_EXPIRY_KEY);

  console.log('[AUTH] Getting token:', {
    hasToken: !!token,
    tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    expiry,
    isExpired: expiry ? new Date(expiry) < new Date() : false,
  });

  if (!token) {
    console.log('[AUTH] No token found in storage');
    return null;
  }

  // Check if token is expired
  if (expiry && new Date(expiry) < new Date()) {
    console.log('[AUTH] Token is expired, attempting refresh');
    // Try to refresh
    const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
    if (refreshToken) {
      try {
        console.log('[AUTH] Refreshing token...');
        const result = await refresh(AUTH_CONFIG, { refreshToken });
        await saveAuthResult(result);
        console.log('[AUTH] Token refreshed successfully');
        return result.accessToken;
      } catch (error) {
        console.error('[AUTH] Token refresh failed:', error);
        await logout();
        return null;
      }
    }
    console.log('[AUTH] No refresh token available, returning null');
    return null;
  }

  console.log('[AUTH] Returning valid token');
  return token;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getToken();
  const authenticated = token !== null;
  console.log('[AUTH] isAuthenticated:', authenticated);
  return authenticated;
}

export async function logout() {
  console.log('[AUTH] Logging out, clearing all tokens');
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY, TOKEN_EXPIRY_KEY]);
}
