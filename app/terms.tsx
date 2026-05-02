import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TermsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={styles.updated}>Last updated: April 2026</Text>

      {[
        { title: '1. Acceptance of Terms', body: 'By using the Kampala Sightseeing Bus app, you agree to these terms. If you do not agree, please do not use the app.' },
        { title: '2. Booking & Payments', body: 'All bookings must be paid in full at the time of reservation. Prices are displayed in both UGX and USD. Payment is processed securely through Flutterwave.' },
        { title: '3. Cancellation Policy', body: 'Free cancellation is available up to 2 hours before departure. Cancellations made within 2 hours of departure are non-refundable.' },
        { title: '4. Boarding', body: 'Passengers must present their QR code ticket at the time of boarding. Arrive at your pick-up stop at least 10 minutes before departure.' },
        { title: '5. Conduct', body: 'Passengers are expected to behave respectfully towards staff and other passengers. KSB reserves the right to refuse service to any passenger.' },
        { title: '6. Liability', body: 'KSB is not liable for delays caused by traffic or unforeseen circumstances. We are committed to providing safe and enjoyable tours.' },
        { title: '7. Changes to Terms', body: 'We may update these terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.' },
        { title: '8. Contact', body: 'For questions about these terms, contact us at legal@ksb.ug or call +256 700 000 000.' },
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