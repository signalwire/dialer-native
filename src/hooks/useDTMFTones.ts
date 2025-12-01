import { useCallback } from 'react';
import InCallManager from 'react-native-incall-manager';

/**
 * Hook to play DTMF tones
 * Automatically respects device silent mode
 */
export function useDTMFTones() {
  const playTone = useCallback((digit: string) => {
    try {
      // Play tone for 200ms (standard DTMF duration)
      InCallManager.startDTMFTone(digit);

      setTimeout(() => {
        InCallManager.stopDTMFTone();
      }, 200);
    } catch (error) {
      console.warn('[DTMF] Failed to play tone:', error);
    }
  }, []);

  return { playTone };
}
