import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const faqs = [
  {
    question: 'How do I book a tour?',
    answer: 'Tap "Quick Book" on the home screen or go to the booking tab. Select your tour, pick-up stop, date and number of seats then proceed to payment.',
  },
  {
    question: 'What payment methods are accepted?',
    answer: 'We accept Mobile Money (MTN & Airtel) and debit/credit cards via our secure payment gateway.',
  },
  {
    question: 'Can I cancel my booking?',
    answer: 'Yes, you can cancel up to 2 hours before departure for a full refund. Go to My Bookings and tap Cancel on your booking.',
  },
  {
    question: 'How do I track my bus?',
    answer: 'Go to the Tracking tab and select your tour route. The bus location updates in real time on the map.',
  },
  {
    question: 'What is the departure time?',
    answer: 'All tours depart at 9:00 AM from their respective starting points — BMK House for City Highlights Tour and BMK Cafe for the Religious Tour.',
  },
  {
    question: 'How do I get my ticket?',
    answer: 'After payment, a digital ticket with a QR code is generated automatically. You can find it under My Bookings.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Contact Cards */}
      <Text style={styles.sectionTitle}>Contact Us</Text>
      <View style={styles.contactCards}>
        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('tel:+256700000000')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="call" size={24} color="#FCDE06" />
          </View>
          <Text style={styles.contactLabel}>Call Us</Text>
          <Text style={styles.contactValue}>+256 700 000 000</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('mailto:info@ksb.ug')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="mail" size={24} color="#FCDE06" />
          </View>
          <Text style={styles.contactLabel}>Email Us</Text>
          <Text style={styles.contactValue}>info@ksb.ug</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.contactCard}
          onPress={() => Linking.openURL('https://wa.me/256700000000')}
        >
          <View style={styles.contactIcon}>
            <Ionicons name="logo-whatsapp" size={24} color="#FCDE06" />
          </View>
          <Text style={styles.contactLabel}>WhatsApp</Text>
          <Text style={styles.contactValue}>Chat with us</Text>
        </TouchableOpacity>
      </View>

      {/* FAQs */}
      <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
      <View style={styles.faqContainer}>
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => setExpanded(expanded === index ? null : index)}
          >
            <View style={styles.faqHeader}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Ionicons
                name={expanded === index ? 'chevron-up' : 'chevron-down'}
                size={18}
                color="#FCDE06"
              />
            </View>
            {expanded === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 28,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  sectionTitle: {
    fontSize: 16, fontWeight: 'bold',
    color: '#FCDE06', marginBottom: 16, marginTop: 8,
  },
  contactCards: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  contactCard: {
    flex: 1, backgroundColor: '#1a1a1a', borderRadius: 12,
    padding: 16, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#333333',
  },
  contactIcon: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center',
  },
  contactLabel: { fontSize: 12, color: '#AAAAAA' },
  contactValue: { fontSize: 11, color: '#FFFFFF', textAlign: 'center' },
  faqContainer: { gap: 2 },
  faqItem: {
    backgroundColor: '#1a1a1a', borderRadius: 10,
    padding: 16, marginBottom: 8,
    borderWidth: 1, borderColor: '#333333',
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#FFFFFF', flex: 1, marginRight: 8 },
  faqAnswer: { fontSize: 13, color: '#AAAAAA', marginTop: 12, lineHeight: 20 },
});