import RateModal from '@/components/RateModal';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, isLoggedIn, logout } = useAuth();
  const [showRateModal, setShowRateModal] = useState(false);

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/login' as any);
        },
      },
    ]);
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.guestContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <View style={styles.guestContent}>
          <Text style={styles.guestEmoji}>🚌</Text>
          <Text style={styles.guestTitle}>My Profile</Text>
          <Text style={styles.guestSubtitle}>
            Log in to access your bookings, track your bus and manage your account.
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login' as any)}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register' as any)}
          >
            <Text style={styles.registerButtonText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const menuItems = [
    { icon: 'calendar-outline', label: 'My Bookings', screen: '/(tabs)/bookings', action: null },
    { icon: 'location-outline', label: 'Track My Bus', screen: '/(tabs)/tracking', action: null },
    { icon: 'notifications-outline', label: 'Notifications', screen: '/notifications', action: null },
    { icon: 'shield-checkmark-outline', label: 'Privacy Policy', screen: '/privacy', action: null },
    { icon: 'document-text-outline', label: 'Terms of Service', screen: '/terms', action: null },
    { icon: 'help-circle-outline', label: 'Help & Support', screen: '/help', action: null },
    { icon: 'star-outline', label: 'Rate the App', screen: null, action: () => setShowRateModal(true) },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={48} color="#FCDE06" />
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.full_name}</Text>
          <Text style={styles.profilePhone}>{user?.phone}</Text>
          {user?.email ? <Text style={styles.profileEmail}>{user.email}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push('/edit-profile' as any)}
        >
          <Ionicons name="pencil-outline" size={20} color="#FCDE06" />
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <View style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuItem, index < menuItems.length - 1 && styles.menuItemBorder]}
            onPress={() =>
              item.action ? item.action() : item.screen && router.push(item.screen as any)
            }
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.menuIconContainer}>
                <Ionicons name={item.icon as any} size={20} color="#FCDE06" />
              </View>
              <Text style={styles.menuItemLabel}>{item.label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#AAAAAA" />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#D90000" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Kampala Sightseeing Bus v1.0.0</Text>

      <View style={{ height: 40 }} />

      <RateModal visible={showRateModal} onClose={() => setShowRateModal(false)} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FCDE06' },
  profileCard: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16,
    marginBottom: 16, borderWidth: 1, borderColor: '#333333',
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FCDE06',
  },
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  profilePhone: { fontSize: 14, color: '#AAAAAA' },
  profileEmail: { fontSize: 14, color: '#AAAAAA' },
  editButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: '#000000',
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333333',
  },
  menuCard: {
    backgroundColor: '#1a1a1a', borderRadius: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#333333', overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', padding: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#333333' },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconContainer: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center',
  },
  menuItemLabel: { fontSize: 15, color: '#FFFFFF' },
  logoutButton: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, borderWidth: 1, borderColor: '#D90000', marginBottom: 16,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#D90000' },
  version: { fontSize: 12, color: '#444444', textAlign: 'center' },
  guestContainer: { flex: 1, backgroundColor: '#000000' },
  guestContent: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 32, gap: 16,
  },
  guestEmoji: { fontSize: 64, marginBottom: 8 },
  guestTitle: { fontSize: 28, fontWeight: 'bold', color: '#FCDE06', textAlign: 'center' },
  guestSubtitle: { fontSize: 14, color: '#AAAAAA', textAlign: 'center', lineHeight: 22, marginBottom: 8 },
  loginButton: {
    backgroundColor: '#FCDE06', borderRadius: 12,
    paddingVertical: 16, width: '100%', alignItems: 'center',
  },
  loginButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  registerButton: {
    borderWidth: 2, borderColor: '#D90000', borderRadius: 12,
    paddingVertical: 16, width: '100%', alignItems: 'center',
  },
  registerButtonText: { fontSize: 16, fontWeight: '600', color: '#D90000' },
});
