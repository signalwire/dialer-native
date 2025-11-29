import { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Button, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { login, getToken, logout } from './auth';

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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SignalWire OAuth Test</Text>

      {token ? (
        <>
          <Text style={styles.status}>Logged in!</Text>
          <Text style={styles.token} numberOfLines={3}>Token: {token.substring(0, 50)}...</Text>
          <Button title="Logout" onPress={handleLogout} />
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
});

export default App;
