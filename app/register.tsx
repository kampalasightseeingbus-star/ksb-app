import { authAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'Please enter your first name.');
      return;
    }
    if (!lastName.trim()) {
      Alert.alert('Error', 'Please enter your last name.');
      return;
    }
    if (!phone.trim() || phone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    try {
      const data = await authAPI.sendRegisterOTP(
        firstName.trim(),
        lastName.trim(),
        phone.trim()
      );

      // Show OTP in dev mode for testing
      if (data.debug_otp) {
        Alert.alert(
          'DEV MODE',
          `OTP: ${data.debug_otp}\n\n(This message only shows during testing)`,
          [{ text: 'OK' }]
        );
      }

      // Go to OTP screen passing the phone number
      router.push({
        pathname: '/otp',
        params: {
          phone: phone.trim(),
          mode: 'register',
        },
      } as any);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <StatusBar barStyle="light-content" backgroundColor="#000000" />

        {/* Logo and title */}
        <View style={styles.header}>
          <Text style={styles.emoji}>🚌</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>
            Join Kampala Sightseeing Bus
          </Text>
        </View>

        <View style={styles.form}>

          {/* First name */}
          <Text style={styles.label}>First Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John"
            placeholderTextColor="#666"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />

          {/* Last name */}
          <Text style={styles.label}>Last Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Mukasa"
            placeholderTextColor="#666"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />

          {/* Phone number */}
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
            />
          </View>
          <Text style={styles.hint}>
            An OTP will be sent to this number via SMS
          </Text>

          {/* Send OTP button */}
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

          {/* Link to login */}
          <TouchableOpacity
            style={styles.link}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.linkText}>
              Already have an account? Log In
            </Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 40 },
  emoji: { fontSize: 56, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FCDE06', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#AAAAAA', marginTop: 6, textAlign: 'center' },
  form: { gap: 8 },
  label: { fontSize: 14, color: '#FFFFFF', marginBottom: 4, marginTop: 12 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: '#FFFFFF', fontSize: 15,
  },
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