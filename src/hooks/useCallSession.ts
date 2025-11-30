import { useRef, useEffect, useState, useCallback } from 'react';
import InCallManager from 'react-native-incall-manager';
import { useClient } from '../contexts/ClientContext';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ended';

interface UseCallSessionParams {
  phoneNumber: string;
  onCallEnded?: () => void;
}

export function useCallSession({ phoneNumber, onCallEnded }: UseCallSessionParams) {
  const { client, initializeClient } = useClient();

  const [callState, setCallState] = useState<CallState>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const callSessionRef = useRef<any>(null);
  const isInitializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (callSessionRef.current) {
      try {
        callSessionRef.current.hangup();
      } catch (error) {
        console.error('Error hanging up call:', error);
      }
      callSessionRef.current = null;
    }

    InCallManager.stop();
    hasInitializedRef.current = false;
    isInitializingRef.current = false;
  }, []);

  const startCall = useCallback(async () => {
    // Prevent double initialization from React strict mode
    if (hasInitializedRef.current || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    setCallState('connecting');

    try {
      // Ensure client is initialized
      let activeClient = client;
      if (!activeClient) {
        activeClient = await initializeClient();
      }

      if (!activeClient) {
        throw new Error('Failed to initialize SignalWire client');
      }

      // Start InCallManager with proper audio routing
      InCallManager.start({ media: 'audio', auto: true, ringback: '' });
      InCallManager.setKeepScreenOn(true);
      InCallManager.setForceSpeakerphoneOn(false);

      const session = await activeClient.dial({ to: phoneNumber });

      // Store session in ref
      callSessionRef.current = session;
      hasInitializedRef.current = true;

      session.on('call.joined', () => {
        setCallState('connected');
        // Start call duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);
      });

      session.on('call.ended', () => {
        setCallState('ended');
        cleanup();
        onCallEnded?.();
      });

      await session.start();
    } catch (error) {
      console.error('Call failed:', error);
      cleanup();
      setCallState('ended');
      onCallEnded?.();
    } finally {
      isInitializingRef.current = false;
    }
  }, [phoneNumber, cleanup, onCallEnded, client, initializeClient]);

  const hangup = useCallback(() => {
    if (callSessionRef.current) {
      setCallState('ended');
      cleanup();
      onCallEnded?.();
    }
  }, [cleanup, onCallEnded]);

  const toggleMute = useCallback(() => {
    if (!callSessionRef.current) return;

    const newMutedState = !isMuted;
    InCallManager.setMicrophoneMute(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  const toggleSpeaker = useCallback(() => {
    const newSpeakerState = !isSpeaker;
    InCallManager.setForceSpeakerphoneOn(newSpeakerState);
    setIsSpeaker(newSpeakerState);
  }, [isSpeaker]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    callState,
    callDuration,
    isMuted,
    isSpeaker,
    startCall,
    hangup,
    toggleMute,
    toggleSpeaker,
  };
}
