import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { useDTMFTones } from '../hooks/useDTMFTones';

interface DialButtonProps {
  digit: string;
  letters?: string;
  onPress: (digit: string) => void;
  onLongPress?: () => void;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

export function DialButton({ digit, letters, onPress, onLongPress }: DialButtonProps) {
  const { playTone } = useDTMFTones();

  const handlePress = () => {
    // Play DTMF tone (respects silent mode)
    playTone(digit);

    // Haptic feedback
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);

    // Call parent handler
    onPress(digit);
  };

  const handleLongPress = () => {
    if (onLongPress) {
      ReactNativeHapticFeedback.trigger('impactHeavy', hapticOptions);
      onLongPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      onLongPress={onLongPress ? handleLongPress : undefined}
      delayLongPress={500}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <Text style={styles.digit}>{digit}</Text>
        {letters && <Text style={styles.letters}>{letters}</Text>}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 8,
  },
  content: {
    alignItems: 'center',
  },
  digit: {
    fontSize: 32,
    fontWeight: '400',
    color: '#FFFFFF',
  },
  letters: {
    fontSize: 10,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 2,
    letterSpacing: 1,
  },
});
