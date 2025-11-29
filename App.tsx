import { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Button, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { login, getToken, logout } from './auth';
import { SignalWire } from '@signalwire/client';
import InCallManager from 'react-native-incall-manager';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected'>('idle');
  const [callSession, setCallSession] = useState<any>(null);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    const savedToken = await getToken();
    setToken(savedToken);
  };

  const handleLogin = async () => {
    try {
      setLoading(true);
      const result = await login();
      setToken(result.accessToken);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
  };

  const startCall = async () => {
    try {
      setCallState('calling');
      const accessToken = await getToken();

      if (!accessToken) {
        console.error('No token available');
        setCallState('idle');
        return;
      }

      InCallManager.start({ media: 'audio' });
      InCallManager.setForceSpeakerphoneOn(false);

      const client = await SignalWire({ token: accessToken });

      const session = await client.dial({
        to: '+9779845862777',
      });

      session.on('call.joined', () => {
        console.log('Call joined!');
        setCallState('connected');
      });

      session.on('call.ended', () => {
        console.log('Call ended');
        setCallState('idle');
        InCallManager.stop();
      });

      await session.start();
      setCallSession(session);

    } catch (error) {
      console.error('Call failed:', error);
      setCallState('idle');
      InCallManager.stop();
    }
  };

  const hangupCall = () => {
    if (callSession) {
      callSession.hangup();
      setCallSession(null);
      setCallState('idle');
      InCallManager.stop();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SignalWire Dialer</Text>

      {token ? (
        <>
          <Text style={styles.status}>Logged in!</Text>
          <Text style={styles.token} numberOfLines={3}>Token: {token.substring(0, 50)}...</Text>

          <View style={styles.callSection}>
            <Text style={styles.callStatus}>
              {callState === 'idle' && 'Ready to call'}
              {callState === 'calling' && 'Calling...'}
              {callState === 'connected' && 'Call Connected'}
            </Text>

            {callState === 'idle' && (
              <Button title="Call +9779845862777" onPress={startCall} />
            )}

            {(callState === 'calling' || callState === 'connected') && (
              <Button title="Hangup" onPress={hangupCall} color="red" />
            )}
          </View>

          <View style={styles.logoutSection}>
            <Button title="Logout" onPress={handleLogout} />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.status}>Not logged in</Text>
          <Button
            title={loading ? "Logging in..." : "Login with SignalWire"}
            onPress={handleLogin}
            disabled={loading}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 18,
    marginBottom: 20,
  },
  token: {
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
  },
  callSection: {
    marginTop: 30,
    alignItems: 'center',
  },
  callStatus: {
    fontSize: 16,
    marginBottom: 15,
    fontWeight: '600',
  },
  logoutSection: {
    marginTop: 40,
  },
});

export default App;
