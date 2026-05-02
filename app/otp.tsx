import { useAuth } from '@/context/AuthContext';
import { authAPI } from '@/lib/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function OTPScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Get phone and mode (register or login) from previous screen
  const { phone, mode } = useLocalSearchParams();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Refs for each OTP input box
  const inputs = useRef<(TextInput | null)[]>([]);

  // Start 60 second countdown when screen loads
  useEffect(() => {
    startTimer();
  }, []);

  const startTimer = () => {
    setCanResend(false);
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Move to next input when a digit is typed
  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    // Auto advance to next box
    if (text && index < 5) {
      inputs.current[index + 1]?.focus();
    }
    // Auto submit when all 6 digits entered
    if (text && index === 5) {
      const fullOtp = [...newOtp].join('');
      if (fullOtp.length === 6) {
        handleVerify(fullOtp);
      }
    }
  };

  // Go back to previous input on backspace
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');
    if (code.length < 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        // Create account and get token
        await authAPI.verifyRegisterOTP(phone as string, code);
      } else {
        // Log in and get token
        await authAPI.verifyLoginOTP(phone as string, code);
      }

      // Refresh user in AuthContext
      await refreshUser();

      // Go to home screen
      router.replace('/(tabs)' as any);
    } catch (err: any) {
      Alert.alert('Invalid OTP', err.message || 'OTP is incorrect. Please try again.');
      // Clear OTP inputs on error
      setOtp(['', '', '', '', '', '']);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setOtp(['', '', '', '', '', '']);

    try {
      let data;
      if (mode === 'register') {
        // We need to resend — but we don't have names here
        // So just alert user to go back and try again
        Alert.alert(
          'Go Back',
          'Please go back and submit your name and number again to get a new OTP.',
          [{ text: 'Go Back', onPress: () => router.back() }]
        );
        return;
      } else {
        data = await authAPI.sendLoginOTP(phone as string);
      }

      if (data?.debug_otp) {
        Alert.alert('DEV MODE', `New OTP: ${data.debug_otp}`);
      }

      startTimer();
      Alert.alert('Sent!', 'A new OTP has been sent to your phone.');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not resend OTP.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.emoji}>📱</Text>
        <Text style={styles.title}>Enter OTP</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.phoneText}>+256 {phone}</Text>
        </Text>
      </View>

      {/* 6 digit OTP input boxes */}
      <View style={styles.otpRow}>
        {otp.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => { inputs.current[index] = ref; }}
            style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
            value={digit}
            onChangeText={(text) => handleChange(text.slice(-1), index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            keyboardType="number-pad"
            maxLength={1}
            autoFocus={index === 0}
            selectTextOnFocus
          />
        ))}
      </View>

      {/* Verify button */}
      <TouchableOpacity
        style={[styles.btn, loading && styles.btnDisabled]}
        onPress={() => handleVerify()}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.btnText}>Verify OTP</Text>
        )}
      </TouchableOpacity>

      {/* Resend timer */}
      <View style={styles.resendRow}>
        <Text style={styles.resendText}>Didn't receive it? </Text>
        <TouchableOpacity onPress={handleResend} disabled={!canResend}>
          <Text style={[styles.resendLink, !canResend && styles.resendLinkDisabled]}>
            {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backText}>← Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: '#000000',
    paddingHorizontal: 24, paddingTop: 80, alignItems: 'center',
  },
  header: { alignItems: 'center', marginBottom: 48 },
  emoji: { fontSize: 56, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FCDE06' },
  subtitle: {
    fontSize: 14, color: '#AAAAAA',
    textAlign: 'center', marginTop: 12, lineHeight: 22,
  },
  phoneText: { color: '#FFFFFF', fontWeight: 'bold' },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 40 },
  otpBox: {
    width: 48, height: 58, borderRadius: 12,
    borderWidth: 2, borderColor: '#333333',
    backgroundColor: '#1a1a1a', color: '#FFFFFF',
    fontSize: 24, fontWeight: 'bold', textAlign: 'center',
  },
  otpBoxFilled: { borderColor: '#FCDE06' },
  btn: {
    backgroundColor: '#FCDE06', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', width: '100%',
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
  resendRow: { flexDirection: 'row', marginTop: 24 },
  resendText: { color: '#AAAAAA', fontSize: 14 },
  resendLink: { color: '#FCDE06', fontSize: 14, fontWeight: '600' },
  resendLinkDisabled: { color: '#444444' },
  backBtn: { marginTop: 24 },
  backText: { color: '#D90000', fontSize: 15 },
});