import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Phone, Delete, UserRound } from 'lucide-react-native';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import Contacts, { Contact } from 'react-native-contacts';
import { DialButton } from './DialButton';
import { ContactPicker } from './ContactPicker';
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
  const [showContactPicker, setShowContactPicker] = useState(false);
  const [contactsList, setContactsList] = useState<Contact[]>([]);

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

  const handleContactPicker = async () => {
    try {
      ReactNativeHapticFeedback.trigger('impactLight', hapticOptions);

      // Check current permission
      const currentPermission = await Contacts.checkPermission();

      let permission = currentPermission;

      // If not authorized, request permission
      if (currentPermission === 'undefined' || currentPermission === 'denied') {
        permission = await Contacts.requestPermission();
      }

      // If still denied, show alert
      if (permission === 'denied') {
        Alert.alert(
          'Permission Required',
          'Please enable contacts access in Settings to select a contact.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Permission is granted, get contacts
      const contacts = await Contacts.getAll();

      // Filter contacts that have phone numbers and sort
      const contactsWithPhones = contacts
        .filter((c: Contact) => c.phoneNumbers && c.phoneNumbers.length > 0)
        .sort((a: Contact, b: Contact) => {
          const nameA = a.givenName || a.familyName || '';
          const nameB = b.givenName || b.familyName || '';
          return nameA.localeCompare(nameB);
        });

      if (contactsWithPhones.length === 0) {
        Alert.alert('No Contacts', 'No contacts with phone numbers found.');
        return;
      }

      setContactsList(contactsWithPhones);
      setShowContactPicker(true);
    } catch (error) {
      console.log('Contact picker error:', error);
      Alert.alert('Error', 'Failed to load contacts. Please try again.');
    }
  };

  const handleContactSelect = (contact: Contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0) {
      const firstNumber = contact.phoneNumbers[0].number;
      const cleaned = firstNumber.replace(/[^\d+]/g, '');
      setPhoneNumber(formatPhoneNumber(cleaned));
    }
    setShowContactPicker(false);
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
          <TouchableOpacity
            style={styles.contactsButton}
            onPress={handleContactPicker}
            activeOpacity={0.7}
          >
            <UserRound size={28} color="#FFFFFF" />
          </TouchableOpacity>

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

      <ContactPicker
        visible={showContactPicker}
        contacts={contactsList}
        onSelect={handleContactSelect}
        onClose={() => setShowContactPicker(false)}
      />
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
  contactsButton: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
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
