import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ClientProvider } from './src/contexts/ClientContext';
import { RootNavigator } from './src/navigation/RootNavigator';

function App() {
  return (
    <SafeAreaProvider>
      <ClientProvider>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <RootNavigator />
      </ClientProvider>
    </SafeAreaProvider>
  );
}

export default App;
