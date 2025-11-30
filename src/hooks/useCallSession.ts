import { useRef, useEffect, useState, useCallback } from 'react';
import InCallManager from 'react-native-incall-manager';
import { DeviceEventEmitter } from 'react-native';
import { useClient } from '../contexts/ClientContext';

export type CallState = 'idle' | 'connecting' | 'connected' | 'hanging_up' | 'ended';

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
  const callStateRef = useRef<CallState>('idle');

  // Helper to update both state and ref atomically
  const updateCallState = useCallback((newState: CallState) => {
    callStateRef.current = newState;
    setCallState(newState);
  }, []);

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
    callStateRef.current = 'idle';
  }, []);

  const startCall = useCallback(async () => {
    // Prevent double initialization from React strict mode
    if (hasInitializedRef.current || isInitializingRef.current) {
      console.log('[CALL] Prevented duplicate call initialization');
      return;
    }

    // Additional check: if we're not in idle state, don't start
    if (callStateRef.current !== 'idle') {
      console.log('[CALL] Call already in progress, state:', callStateRef.current);
      return;
    }

    isInitializingRef.current = true;
    updateCallState('connecting');

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
        console.log('[CALL] Call joined');
        updateCallState('connected');

        // Start call duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        // Listen for audio device changes (for debugging)
        const onAudioDeviceChanged = DeviceEventEmitter.addListener(
          'onAudioDeviceChanged',
          (data: any) => {
            console.log('[AUDIO] Device changed:', data);
          }
        );

        const onWiredHeadset = DeviceEventEmitter.addListener(
          'WiredHeadset',
          (data: any) => {
            console.log('[AUDIO] Wired headset event:', data);
          }
        );

        // Cleanup listeners when call ends
        return () => {
          onAudioDeviceChanged.remove();
          onWiredHeadset.remove();
        };
      });

      session.on('call.ended', () => {
        console.log('[CALL] Call ended');
        updateCallState('ended');
        cleanup();
        onCallEnded?.();
      });

      session.on('destroy', () => {
        console.log('[CALL] Call destroyed (other party hung up)');
        updateCallState('ended');
        cleanup();
        onCallEnded?.();
      });

      await session.start();
    } catch (error) {
      console.error('Call failed:', error);
      cleanup();
      updateCallState('ended');

      // Only call onCallEnded if we actually had a session
      // This prevents navigation on initialization errors
      if (callSessionRef.current) {
        onCallEnded?.();
      }
    } finally {
      isInitializingRef.current = false;
    }
  }, [phoneNumber, cleanup, onCallEnded, client, initializeClient, updateCallState]);

  const hangup = useCallback(() => {
    if (callSessionRef.current) {
      updateCallState('hanging_up');
      try {
        callSessionRef.current.hangup();
        // Don't cleanup here - wait for destroy event
      } catch (error) {
        console.error('Error initiating hangup:', error);
        // If hangup fails, cleanup immediately
        updateCallState('ended');
        cleanup();
        onCallEnded?.();
      }
    }
  }, [cleanup, onCallEnded, updateCallState]);

  const toggleMute = useCallback(() => {
    if (!callSessionRef.current || callStateRef.current !== 'connected') return;

    const newMutedState = !isMuted;
    InCallManager.setMicrophoneMute(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted]);

  const toggleSpeaker = useCallback(() => {
    if (callStateRef.current !== 'connected') return;

    const newSpeakerState = !isSpeaker;
    InCallManager.setForceSpeakerphoneOn(newSpeakerState);
    setIsSpeaker(newSpeakerState);
  }, [isSpeaker]);

  const sendDigits = useCallback((digits: string) => {
    if (!callSessionRef.current || callStateRef.current !== 'connected') {
      console.warn('[CALL] Cannot send digits - call not connected');
      return;
    }

    try {
      console.log('[CALL] Sending DTMF digits:', digits);
      callSessionRef.current.sendDigits(digits);
    } catch (error) {
      console.error('[CALL] Error sending digits:', error);
    }
  }, []);

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
    sendDigits,
  };
}
