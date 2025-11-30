import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Phone, Delete } from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { DialButton } from './DialButton';
import { formatPhoneNumber, getRawPhoneNumber } from '../utils/phoneFormatter';

interface DialPadProps {
  onCall: (phoneNumber: string) => void;
}

const hapticOptions = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false,
};

const DIAL_BUTTONS = [
  [
    { digit: '1', letters: '' },
    { digit: '2', letters: 'ABC' },
    { digit: '3', letters: 'DEF' },
  ],
  [
    { digit: '4', letters: 'GHI' },
    { digit: '5', letters: 'JKL' },
    { digit: '6', letters: 'MNO' },
  ],
  [
    { digit: '7', letters: 'PQRS' },
    { digit: '8', letters: 'TUV' },
    { digit: '9', letters: 'WXYZ' },
  ],
  [
    { digit: '*', letters: '' },
    { digit: '0', letters: '+' },
    { digit: '#', letters: '' },
  ],
];

export function DialPad({ onCall }: DialPadProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleDigitPress = (digit: string) => {
    const raw = getRawPhoneNumber(phoneNumber);
    setPhoneNumber(formatPhoneNumber(raw + digit));
  };

  const handleZeroLongPress = () => {
    const raw = getRawPhoneNumber(phoneNumber);
    // Replace last 0 with + or add + if no 0
    if (raw.endsWith('0')) {
      const newRaw = raw.slice(0, -1) + '+';
      setPhoneNumber(formatPhoneNumber(newRaw));
    } else {
      setPhoneNumber(formatPhoneNumber(raw + '+'));
    }
  };

  const handleBackspace = () => {
    ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);
    const raw = getRawPhoneNumber(phoneNumber);
    if (raw.length > 0) {
      setPhoneNumber(formatPhoneNumber(raw.slice(0, -1)));
    }
  };

  const handleBackspaceLongPress = () => {
    ReactNativeHapticFeedback.trigger('impactMedium', hapticOptions);
    setPhoneNumber('');
  };

  const handleCall = () => {
    if (phoneNumber.trim()) {
      ReactNativeHapticFeedback.trigger('notificationSuccess', hapticOptions);
      const raw = getRawPhoneNumber(phoneNumber);
      onCall(raw);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.displayContainer}>
        <Text style={styles.phoneNumber} numberOfLines={1}>
          {phoneNumber || 'Enter number'}
        </Text>
      </View>

      <View style={styles.dialPad}>
        {DIAL_BUTTONS.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {row.map((button) => (
              <DialButton
                key={button.digit}
                digit={button.digit}
                letters={button.letters}
                onPress={handleDigitPress}
                onLongPress={button.digit === '0' ? handleZeroLongPress : undefined}
              />
            ))}
          </View>
        ))}

        <View style={styles.actionRow}>
          <View style={styles.spacer} />

          <TouchableOpacity
            style={[styles.callButton, !phoneNumber && styles.callButtonDisabled]}
            onPress={handleCall}
            disabled={!phoneNumber}
            activeOpacity={0.7}
          >
            <Phone size={32} color="#FFFFFF" strokeWidth={2.5} />
          </TouchableOpacity>

          {phoneNumber ? (
            <TouchableOpacity
              style={styles.backspaceButton}
              onPress={handleBackspace}
              onLongPress={handleBackspaceLongPress}
              delayLongPress={500}
              activeOpacity={0.7}
            >
              <Delete size={28} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.spacer} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  displayContainer: {
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  phoneNumber: {
    fontSize: 28,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  dialPad: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 4,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 8,
  },
  spacer: {
    width: 80,
  },
  callButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonDisabled: {
    backgroundColor: '#1C3D29',
    opacity: 0.5,
  },
  backspaceButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
