import { useAuth } from '@/context/AuthContext';
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

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name) {
      Alert.alert('Error', 'Name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.updateProfile(name, email);
      await refreshUser();
      Alert.alert('Success', 'Profile updated successfully!', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={52} color="#FCDE06" />
        </View>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholderTextColor="#666"
          placeholder="Your full name"
        />

        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={[styles.input, styles.inputDisabled]}
          value={user?.phone || ''}
          editable={false}
        />
        <Text style={styles.inputHint}>Phone number cannot be changed</Text>

        <Text style={styles.label}>Email Address</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
          placeholder="your@email.com"
        />

        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#000000" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 32,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatar: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#1a1a1a', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: '#FCDE06',
  },
  form: { gap: 8 },
  label: { fontSize: 14, color: '#FFFFFF', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: '#FFFFFF', fontSize: 15,
  },
  inputDisabled: { opacity: 0.5 },
  inputHint: { fontSize: 12, color: '#666666', marginTop: 4 },
  saveButton: {
    backgroundColor: '#FCDE06', paddingVertical: 16,
    borderRadius: 12, alignItems: 'center', marginTop: 24,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
});
