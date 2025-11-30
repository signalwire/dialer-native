import { useRef, useEffect, useState, useCallback } from 'react';
import InCallManager from 'react-native-incall-manager';
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
  const [availableAudioDevices, setAvailableAudioDevices] = useState<string[]>([]);
  const [selectedAudioDevice, setSelectedAudioDevice] = useState<string>('SPEAKER_PHONE');

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
        console.log('[CALL] Call joined');
        setCallState('connected');

        // Start call duration timer
        durationIntervalRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        // Check for available audio devices
        InCallManager.checkRecordPermission().then(() => {
          // Get available audio devices
          const devices = ['EARPIECE', 'SPEAKER_PHONE'];

          // Note: InCallManager doesn't provide a direct way to list devices
          // We'll assume common devices. Bluetooth will be auto-detected by the system
          setAvailableAudioDevices(devices);
        });
      });

      session.on('call.ended', () => {
        console.log('[CALL] Call ended');
        setCallState('ended');
        cleanup();
        onCallEnded?.();
      });

      session.on('destroy', () => {
        console.log('[CALL] Call destroyed (other party hung up)');
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
      setCallState('hanging_up');
      try {
        callSessionRef.current.hangup();
        // Don't cleanup here - wait for destroy event
      } catch (error) {
        console.error('Error initiating hangup:', error);
        // If hangup fails, cleanup immediately
        setCallState('ended');
        cleanup();
        onCallEnded?.();
      }
    }
  }, [cleanup, onCallEnded]);

  const toggleMute = useCallback(() => {
    if (!callSessionRef.current || callState !== 'connected') return;

    const newMutedState = !isMuted;
    InCallManager.setMicrophoneMute(newMutedState);
    setIsMuted(newMutedState);
  }, [isMuted, callState]);

  const toggleSpeaker = useCallback(() => {
    if (callState !== 'connected') return;

    const newSpeakerState = !isSpeaker;
    InCallManager.setForceSpeakerphoneOn(newSpeakerState);
    setIsSpeaker(newSpeakerState);
  }, [isSpeaker, callState]);

  const selectAudioDevice = useCallback((device: string) => {
    if (callState !== 'connected') return;

    setSelectedAudioDevice(device);

    // Handle different device types
    switch (device) {
      case 'SPEAKER_PHONE':
        InCallManager.setForceSpeakerphoneOn(true);
        setIsSpeaker(true);
        break;
      case 'EARPIECE':
        InCallManager.setForceSpeakerphoneOn(false);
        setIsSpeaker(false);
        break;
      case 'BLUETOOTH':
      case 'WIRED_HEADSET':
        InCallManager.setForceSpeakerphoneOn(false);
        setIsSpeaker(false);
        break;
    }
  }, [callState]);

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
    availableAudioDevices,
    selectedAudioDevice,
    startCall,
    hangup,
    toggleMute,
    toggleSpeaker,
    selectAudioDevice,
  };
}
