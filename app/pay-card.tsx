import { paymentsAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function PayCardScreen() {
  const router = useRouter();
  const {
    scheduleId, seatNumber, amount,
    currency, routeName, passengers,
  } = useLocalSearchParams();

  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [orderTrackingId, setOrderTrackingId] = useState('');

  const formatCard = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleaned;
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace('/', '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handlePay = async () => {
    if (!cardNumber || !expiry || !cvv || !name) {
      Alert.alert('Error', 'Please fill in all card details');
      return;
    }

    setLoading(true);
    try {
      const data = await paymentsAPI.initiate(
        Number(scheduleId),
        Number(seatNumber),
        'card',
        String(currency || 'UGX'),
        Number(passengers || 1)
      );

      setBookingId(data.booking_id);
      setOrderTrackingId(data.order_tracking_id);
      setPaymentUrl(data.redirect_url);
      setShowWebView(true);
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigation = async (navState: any) => {
    const url = navState.url;

    if (url.includes('pesapal/callback') || url.includes('ksb://receipt')) {
      setShowWebView(false);

      if (bookingId && orderTrackingId) {
        try {
          const verification = await paymentsAPI.verify(orderTrackingId, bookingId);

          if (verification.status === 'paid') {
            router.replace({
              pathname: '/receipt',
              params: { bookingId: String(bookingId) },
            } as any);
          } else {
            Alert.alert(
              'Payment Pending',
              'Your payment is being processed.',
              [
                {
                  text: 'View Booking',
                  onPress: () => router.replace({
                    pathname: '/receipt',
                    params: { bookingId: String(bookingId) },
                  } as any),
                },
              ]
            );
          }
        } catch (err) {
          Alert.alert('Error', 'Could not verify payment.');
        }
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Pesapal WebView */}
      <Modal visible={showWebView} animationType="slide">
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Cancel Payment',
                  'Are you sure you want to cancel?',
                  [
                    { text: 'Continue', style: 'cancel' },
                    {
                      text: 'Cancel',
                      style: 'destructive',
                      onPress: () => setShowWebView(false),
                    },
                  ]
                );
              }}
            >
              <Ionicons name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.webViewTitle}>🔒 Secure Payment</Text>
            <View style={{ width: 24 }} />
          </View>
          <WebView
            source={{ uri: paymentUrl }}
            onNavigationStateChange={handleWebViewNavigation}
            style={styles.webView}
            startInLoadingState
            renderLoading={() => (
              <View style={styles.webViewLoading}>
                <ActivityIndicator size="large" color="#FCDE06" />
                <Text style={styles.webViewLoadingText}>Loading...</Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Main Screen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>
            {currency === 'USD' ? '$' : 'UGX '}
            {Number(amount || 50000).toLocaleString()}
          </Text>
          <Text style={styles.amountSub}>
            {routeName} · {passengers} passenger{Number(passengers) > 1 ? 's' : ''}
          </Text>
        </View>

        <Text style={styles.label}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor="#666"
          keyboardType="number-pad"
          value={cardNumber}
          onChangeText={(t) => setCardNumber(formatCard(t))}
          maxLength={19}
        />

        <Text style={styles.label}>Cardholder Name</Text>
        <TextInput
          style={styles.input}
          placeholder="As shown on card"
          placeholderTextColor="#666"
          value={name}
          onChangeText={(t) => setName(t.toUpperCase())}
        />

        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.label}>Expiry</Text>
            <TextInput
              style={styles.input}
              placeholder="MM/YY"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              value={expiry}
              onChangeText={(t) => setExpiry(formatExpiry(t))}
              maxLength={5}
            />
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.label}>CVV</Text>
            <TextInput
              style={styles.input}
              placeholder="•••"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
              maxLength={3}
            />
          </View>
        </View>

        <View style={styles.cardsRow}>
          {['VISA', 'Mastercard', 'Verve'].map((card) => (
            <View key={card} style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{card}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.payBtn, loading && styles.payBtnLoading]}
          onPress={handlePay}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator color="#000000" />
              <Text style={styles.payBtnText}>Connecting to Pesapal...</Text>
            </>
          ) : (
            <>
              <Ionicons name="lock-closed" size={20} color="#000000" />
              <Text style={styles.payBtnText}>
                Pay {currency === 'USD' ? '$' : 'UGX '}
                {Number(amount || 50000).toLocaleString()}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.secure}>🔒 Secured by Pesapal</Text>
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  webViewContainer: { flex: 1, backgroundColor: '#000000' },
  webViewHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60,
    paddingBottom: 16, backgroundColor: '#000000',
    borderBottomWidth: 1, borderBottomColor: '#222222',
  },
  webViewTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  webView: { flex: 1 },
  webViewLoading: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#000000', gap: 16,
  },
  webViewLoadingText: { color: '#AAAAAA', fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60,
    paddingBottom: 20, borderBottomWidth: 3, borderBottomColor: '#FCDE06',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 40 },
  amountCard: {
    backgroundColor: '#FCDE06', borderRadius: 16, padding: 20,
    alignItems: 'center', gap: 4, marginBottom: 20,
  },
  amountLabel: { fontSize: 13, color: '#333333' },
  amountValue: { fontSize: 28, fontWeight: 'bold', color: '#000000' },
  amountSub: { fontSize: 13, color: '#333333' },
  label: { fontSize: 14, color: '#FFFFFF', marginTop: 16, marginBottom: 6 },
  input: {
    backgroundColor: '#1a1a1a', borderWidth: 1, borderColor: '#333',
    borderRadius: 10, paddingHorizontal: 16, paddingVertical: 14,
    color: '#FFFFFF', fontSize: 15,
  },
  row: { flexDirection: 'row', gap: 12 },
  rowItem: { flex: 1 },
  cardsRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  cardBadge: {
    backgroundColor: '#1a1a1a', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: '#333333',
  },
  cardBadgeText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  payBtn: {
    backgroundColor: '#FCDE06', borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginTop: 24,
  },
  payBtnLoading: { backgroundColor: '#333333' },
  payBtnText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  secure: { fontSize: 12, color: '#666666', textAlign: 'center', marginTop: 12 },
});