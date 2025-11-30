import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX } from 'lucide-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation';
import { useCallSession } from '../hooks/useCallSession';
import { formatPhoneNumber } from '../utils/phoneFormatter';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type CallRouteProp = RouteProp<RootStackParamList, 'Call'>;

export function CallScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<CallRouteProp>();
  const { phoneNumber, contactName } = route.params;

  const {
    callState,
    callDuration,
    isMuted,
    isSpeaker,
    startCall,
    hangup,
    toggleMute,
    toggleSpeaker,
  } = useCallSession({
    phoneNumber: phoneNumber || '+9779845862777',
    onCallEnded: () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        navigation.replace('Dialer');
      }
    },
  });

  useEffect(() => {
    startCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - startCall has internal guards

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleHangup = () => {
    hangup();
  };

  return (
    <View style={styles.container}>
      <View style={styles.callInfo}>
        <View style={styles.avatarContainer}>
          <Phone size={48} color="#FFFFFF" strokeWidth={1.5} />
        </View>

        {contactName ? (
          <>
            <Text style={styles.contactName}>{contactName}</Text>
            <Text style={styles.phoneNumberSmall}>
              {formatPhoneNumber(phoneNumber || '+9779845862777')}
            </Text>
          </>
        ) : (
          <Text style={styles.phoneNumber}>
            {formatPhoneNumber(phoneNumber || '+9779845862777')}
          </Text>
        )}

        <View style={styles.statusContainer}>
          {callState === 'connecting' && (
            <>
              <ActivityIndicator size="small" color="#F72B73" style={styles.loader} />
              <Text style={styles.statusText}>Connecting...</Text>
            </>
          )}
          {callState === 'connected' && (
            <Text style={styles.statusText}>{formatDuration(callDuration)}</Text>
          )}
          {callState === 'hanging_up' && (
            <>
              <ActivityIndicator size="small" color="#FF3B30" style={styles.loader} />
              <Text style={styles.statusText}>Hanging up...</Text>
            </>
          )}
          {callState === 'ended' && (
            <Text style={styles.statusText}>Call Ended</Text>
          )}
        </View>
      </View>

      <View style={styles.controls}>
        <View style={styles.controlRow}>
          <TouchableOpacity
            style={[styles.controlButton, isMuted && styles.controlButtonActive]}
            onPress={toggleMute}
            disabled={callState !== 'connected'}
          >
            {isMuted ? (
              <MicOff size={28} color="#FFFFFF" />
            ) : (
              <Mic size={28} color="#FFFFFF" />
            )}
            <Text style={[styles.controlLabel, isMuted && styles.controlLabelActive]}>Mute</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, isSpeaker && styles.controlButtonActive]}
            onPress={toggleSpeaker}
            disabled={callState !== 'connected'}
          >
            {isSpeaker ? (
              <Volume2 size={28} color="#FFFFFF" />
            ) : (
              <VolumeX size={28} color="#FFFFFF" />
            )}
            <Text style={[styles.controlLabel, isSpeaker && styles.controlLabelActive]}>Speaker</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.hangupButton} onPress={handleHangup}>
          <PhoneOff size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  callInfo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  phoneNumber: {
    fontSize: 32,
    fontWeight: '300',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1,
  },
  contactName: {
    fontSize: 32,
    fontWeight: '400',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  phoneNumberSmall: {
    fontSize: 18,
    fontWeight: '300',
    color: '#8E8E93',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  loader: {
    marginRight: 8,
  },
  statusText: {
    fontSize: 16,
    color: '#8E8E93',
    fontWeight: '300',
  },
  controls: {
    paddingHorizontal: 32,
    paddingBottom: 60,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  controlButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1C1C1E',
  },
  controlButtonActive: {
    backgroundColor: '#0A84FF',
  },
  controlLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '400',
  },
  controlLabelActive: {
    color: '#FFFFFF',
  },
  hangupButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FF3B30',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
});
