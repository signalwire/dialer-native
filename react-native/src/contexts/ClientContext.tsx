import React, { createContext, useContext, useRef, useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { SignalWire } from '@signalwire/client';
import { getToken } from '../services/auth';

interface ClientContextValue {
  client: any | null;
  isInitializing: boolean;
  initializeClient: () => Promise<void>;
  destroyClient: () => void;
}

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const clientRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const appStateRef = useRef(AppState.currentState);

  const destroyClient = () => {
    if (clientRef.current) {
      try {
        // Clean up client if it has cleanup methods
        if (typeof clientRef.current.destroy === 'function') {
          clientRef.current.destroy();
        }
      } catch (error) {
        console.error('Error destroying client:', error);
      }
      clientRef.current = null;
    }
    isInitializingRef.current = false;
    setIsInitializing(false);
  };

  const initializeClient = async () => {
    // If already initialized or initializing, return existing client
    if (clientRef.current) {
      return clientRef.current;
    }

    if (isInitializingRef.current) {
      // Wait for ongoing initialization
      while (isInitializingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return clientRef.current;
    }

    isInitializingRef.current = true;
    setIsInitializing(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const client = await SignalWire({ token });
      clientRef.current = client;
      return client;
    } catch (error) {
      console.error('Failed to initialize SignalWire client:', error);
      throw error;
    } finally {
      isInitializingRef.current = false;
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      const previousAppState = appStateRef.current;
      appStateRef.current = nextAppState;

      // When app goes to background, destroy the client
      if (
        previousAppState === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        console.log('App going to background, destroying client');
        destroyClient();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup on unmount
    return () => {
      subscription.remove();
      destroyClient();
    };
  }, []);

  const value: ClientContextValue = {
    client: clientRef.current,
    isInitializing,
    initializeClient,
    destroyClient,
  };

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClient() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClient must be used within a ClientProvider');
  }
  return context;
}
