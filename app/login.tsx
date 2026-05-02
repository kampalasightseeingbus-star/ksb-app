import { authAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim() || phone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.sendLoginOTP(phone.trim());

      // Show OTP in dev mode
      if (data.debug_otp) {
        Alert.alert(
          'DEV MODE',
          `OTP: ${data.debug_otp}\n\n(This message only shows during testing)`,
          [{ text: 'OK' }]
        );
      }

      // Go to OTP screen
      router.push({
        pathname: '/otp',
        params: {
          phone: phone.trim(),
          mode: 'login',
        },
      } as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.emoji}>🚌</Text>
        <Text style={styles.title}>Welcome Back</Text>
        <Text style={styles.subtitle}>
          Enter your phone number to receive a login OTP
        </Text>
      </View>

      <View style={styles.form}>

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.countryCode}>
            <Text style={styles.countryCodeText}>🇺🇬 +256</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="700 000 000"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={10}
            autoFocus
          />
        </View>
        <Text style={styles.hint}>
          We'll send a 6-digit OTP to this number
        </Text>

        <TouchableOpacity
          style={[styles.btn, loading && styles.btnDisabled]}
          onPress={handleSendOTP}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <>
              <Ionicons name="phone-portrait-outline" size={20} color="#000000" />
              <Text style={styles.btnText}>Send OTP</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.link}
          onPress={() => router.push('/register' as any)}
        >
          <Text style={styles.linkText}>
            Don't have an account? Sign Up
          </Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FCDE06', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#AAAAAA', marginTop: 6, textAlign: 'center', lineHeight: 22 },
  form: { gap: 8 },
  label: { fontSize: 14, color: '#FFFFFF', marginBottom: 4, marginTop: 12 },
  phoneRow: {
    flexDirection: 'row', backgroundColor: '#1a1a1a',
    borderWidth: 1, borderColor: '#333', borderRadius: 10, overflow: 'hidden',
  },
  countryCode: {
    paddingHorizontal: 14, paddingVertical: 14,
    borderRightWidth: 1, borderRightColor: '#333',
    justifyContent: 'center',
  },
  countryCodeText: { color: '#FCDE06', fontWeight: 'bold', fontSize: 14 },
  phoneInput: {
    flex: 1, paddingHorizontal: 14, paddingVertical: 14,
    color: '#FFFFFF', fontSize: 15,
  },
  hint: { fontSize: 12, color: '#666666', marginTop: 6 },
  btn: {
    backgroundColor: '#FCDE06', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center',
    gap: 8, marginTop: 28,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#000000', fontSize: 18, fontWeight: 'bold' },
  link: { alignItems: 'center', marginTop: 20 },
  linkText: { color: '#D90000', fontSize: 15 },
});