import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.updated}>Last updated: April 2026</Text>

      {[
        { title: '1. Information We Collect', body: 'We collect your name, phone number, email address, and payment information when you register and book tours. We also collect location data when you use the tracking feature.' },
        { title: '2. How We Use Your Information', body: 'Your information is used to process bookings, send notifications, provide customer support, and improve our services. We do not sell your personal data to third parties.' },
        { title: '3. Payment Security', body: 'All payments are processed securely through Flutterwave. We do not store your card details on our servers.' },
        { title: '4. Location Data', body: 'Location data is only collected when you actively use the tracking feature. This data is used solely to show you the bus location and estimated arrival times.' },
        { title: '5. Data Retention', body: 'We retain your account data for as long as your account is active. Booking records are kept for 12 months for reference purposes.' },
        { title: '6. Contact Us', body: 'For privacy concerns, contact us at privacy@ksb.ug or call +256 700 000 000.' },
      ].map((section, index) => (
        <View key={index} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          <Text style={styles.sectionBody}>{section.body}</Text>
        </View>
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  updated: { fontSize: 13, color: '#666666', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#FCDE06', marginBottom: 8 },
  sectionBody: { fontSize: 14, color: '#AAAAAA', lineHeight: 22 },
});