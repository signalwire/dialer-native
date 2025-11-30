import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { logout } from '../services/auth';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../types/navigation';
import { DialPad } from '../components';
import { toE164 } from '../utils/phoneFormatter';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export function DialerScreen() {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    await logout();
    navigation.replace('Welcome');
  };

  const handleCall = (phoneNumber: string) => {
    const e164Number = toE164(phoneNumber);
    navigation.navigate('Call', { phoneNumber: e164Number });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <LogOut size={24} color="#8E8E93" />
        </TouchableOpacity>
      </View>

      <DialPad onCall={handleCall} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 8,
  },
  logoutButton: {
    padding: 8,
  },
});
