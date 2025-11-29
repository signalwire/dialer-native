import { authorize } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_CONFIG = {
  issuer: 'https://id.fabric.signalwire.com/',
  serviceConfiguration: {
    authorizationEndpoint: 'https://id.fabric.signalwire.com/login/oauth/authorize',
    tokenEndpoint: 'https://id.fabric.signalwire.com/oauth/token',
  },
  clientId: 'lMcMQXRiDbuzI49cSfAkGZ4aoObh99LEu-1HudX5Di4',
  redirectUrl: 'com.dialer://oauth-callback',
  clientAuthMethod: 'post',
  scopes: [],
};

const TOKEN_KEY = 'auth_token';

export async function login() {
  try {
    const result = await authorize(AUTH_CONFIG);
    await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
    return result;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

export async function getToken() {
  return await AsyncStorage.getItem(TOKEN_KEY);
}

export async function logout() {
  await AsyncStorage.removeItem(TOKEN_KEY);
}
