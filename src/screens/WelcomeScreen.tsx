import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Phone, Lock } from 'lucide-react-native';
import { login } from '../services/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function WelcomeScreen() {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation<NavigationProp>();

  const handleLogin = async () => {
    try {
      setLoading(true);
      await login();
      navigation.replace('Dialer');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Phone size={80} color="#F72B73" strokeWidth={1.5} />
        </View>

        <Text style={styles.title}>SignalWire Dialer</Text>
        <Text style={styles.subtitle}>
          Make secure calls with SignalWire's enterprise-grade communication platform
        </Text>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <Lock size={20} color="#FFFFFF" style={styles.buttonIcon} />
              <Text style={styles.loginButtonText}>Login with SignalWire</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  logo: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 120,
    height: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  title: {
    fontSize: 36,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 60,
    fontWeight: '300',
  },
  loginButton: {
    backgroundColor: '#F72B73',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    maxWidth: 320,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
