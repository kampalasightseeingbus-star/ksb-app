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

export default function PayMobileScreen() {
  const router = useRouter();
  const {
    scheduleId,
    seatNumber,
    amount,
    currency,
    routeName,
    passengers,
    paymentMethod,
  } = useLocalSearchParams();

  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState<'mtn' | 'airtel' | null>(null);
  const [loading, setLoading] = useState(false);
  const [showWebView, setShowWebView] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [bookingId, setBookingId] = useState<number | null>(null);
  const [orderTrackingId, setOrderTrackingId] = useState('');

  const handlePay = async () => {
    if (!network) {
      Alert.alert('Error', 'Please select MTN or Airtel');
      return;
    }
    if (!phone || phone.length < 9) {
      Alert.alert('Error', 'Please enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      // Initiate payment with Pesapal
      const data = await paymentsAPI.initiate(
        Number(scheduleId),
        Number(seatNumber),
        network === 'mtn' ? 'mtn_momo' : 'airtel_money',
        String(currency || 'UGX'),
        Number(passengers || 1)
      );

      // Save booking ID and tracking ID for verification
      setBookingId(data.booking_id);
      setOrderTrackingId(data.order_tracking_id);

      // Open Pesapal payment page in WebView
      setPaymentUrl(data.redirect_url);
      setShowWebView(true);
    } catch (err: any) {
      Alert.alert('Payment Failed', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // Handle WebView navigation to detect payment completion
  const handleWebViewNavigation = async (navState: any) => {
    const url = navState.url;

    // Detect when Pesapal redirects back to our callback URL
    if (url.includes('pesapal/callback') || url.includes('ksb://receipt')) {
      setShowWebView(false);

      // Verify the payment
      if (bookingId && orderTrackingId) {
        try {
          const verification = await paymentsAPI.verify(orderTrackingId, bookingId);

          if (verification.status === 'paid') {
            // Payment successful - go to receipt
            router.replace({
              pathname: '/receipt',
              params: { bookingId: String(bookingId) },
            } as any);
          } else if (verification.status === 'pending') {
            // Payment still processing
            Alert.alert(
              'Payment Processing',
              'Your payment is being processed. Please approve the prompt on your phone.',
              [
                {
                  text: 'Check Again',
                  onPress: async () => {
                    const recheck = await paymentsAPI.verify(orderTrackingId, bookingId);
                    if (recheck.status === 'paid') {
                      router.replace({
                        pathname: '/receipt',
                        params: { bookingId: String(bookingId) },
                      } as any);
                    }
                  },
                },
                {
                  text: 'Go Home',
                  onPress: () => router.replace('/(tabs)' as any),
                },
              ]
            );
          } else {
            Alert.alert('Payment Failed', 'Your payment was not completed. Please try again.');
          }
        } catch (err) {
          Alert.alert('Error', 'Could not verify payment. Contact support with your booking reference.');
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

      {/* Pesapal WebView Payment Page */}
      <Modal visible={showWebView} animationType="slide">
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  'Cancel Payment',
                  'Are you sure you want to cancel this payment?',
                  [
                    { text: 'Continue Paying', style: 'cancel' },
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
            <Text style={styles.webViewTitle}>Secure Payment</Text>
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
                <Text style={styles.webViewLoadingText}>
                  Loading payment page...
                </Text>
              </View>
            )}
          />
        </View>
      </Modal>

      {/* Main Payment Screen */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mobile Money</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>

        {/* Amount */}
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

        {/* Network selection */}
        <Text style={styles.sectionTitle}>Select Network</Text>
        <TouchableOpacity
          style={[styles.networkCard, network === 'mtn' && styles.networkSelected]}
          onPress={() => setNetwork('mtn')}
        >
          <Text style={styles.networkEmoji}>🟡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.networkName}>MTN Mobile Money</Text>
            <Text style={styles.networkSub}>Uganda</Text>
          </View>
          {network === 'mtn' && (
            <Ionicons name="checkmark-circle" size={22} color="#FCDE06" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.networkCard, network === 'airtel' && styles.networkSelected]}
          onPress={() => setNetwork('airtel')}
        >
          <Text style={styles.networkEmoji}>🔴</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.networkName}>Airtel Money</Text>
            <Text style={styles.networkSub}>Uganda</Text>
          </View>
          {network === 'airtel' && (
            <Ionicons name="checkmark-circle" size={22} color="#FCDE06" />
          )}
        </TouchableOpacity>

        {/* Phone number */}
        <Text style={styles.sectionTitle}>Mobile Money Number</Text>
        <View style={styles.phoneRow}>
          <Text style={styles.countryCode}>🇺🇬 +256</Text>
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
          You will receive a payment prompt on this number to approve.
        </Text>

        {/* How it works */}
        <View style={styles.stepsCard}>
          <Text style={styles.stepsTitle}>How it works</Text>
          <Text style={styles.step}>1️⃣  Tap "Pay Now" below</Text>
          <Text style={styles.step}>2️⃣  You'll be taken to secure Pesapal page</Text>
          <Text style={styles.step}>3️⃣  Enter your Mobile Money PIN</Text>
          <Text style={styles.step}>4️⃣  Payment confirmed → your ticket is ready</Text>
        </View>

        {/* Pay Button */}
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
              <Ionicons name="phone-portrait-outline" size={20} color="#000000" />
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
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    backgroundColor: '#000000', borderBottomWidth: 1,
    borderBottomColor: '#222222',
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
    backgroundColor: '#FCDE06', borderRadius: 16,
    padding: 20, alignItems: 'center', gap: 4, marginBottom: 24,
  },
  amountLabel: { fontSize: 13, color: '#333333' },
  amountValue: { fontSize: 32, fontWeight: 'bold', color: '#000000' },
  amountSub: { fontSize: 13, color: '#333333' },
  sectionTitle: {
    fontSize: 15, fontWeight: 'bold',
    color: '#FFFFFF', marginTop: 16, marginBottom: 10,
  },
  networkCard: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 2, borderColor: '#333333', marginBottom: 10,
  },
  networkSelected: { borderColor: '#FCDE06', backgroundColor: '#111100' },
  networkEmoji: { fontSize: 24 },
  networkName: { fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  networkSub: { fontSize: 12, color: '#666666' },
  phoneRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#1a1a1a', borderRadius: 12,
    borderWidth: 2, borderColor: '#333333', overflow: 'hidden', marginBottom: 8,
  },
  countryCode: {
    paddingHorizontal: 16, paddingVertical: 16,
    color: '#FCDE06', fontWeight: 'bold', fontSize: 14,
    borderRightWidth: 1, borderRightColor: '#333333',
  },
  phoneInput: {
    flex: 1, paddingHorizontal: 16,
    paddingVertical: 16, color: '#FFFFFF', fontSize: 16,
  },
  hint: { fontSize: 12, color: '#666666', marginBottom: 16, lineHeight: 18 },
  stepsCard: {
    backgroundColor: '#1a1a1a', borderRadius: 12, padding: 16,
    gap: 8, borderWidth: 1, borderColor: '#333333', marginBottom: 8,
  },
  stepsTitle: {
    fontSize: 13, color: '#FCDE06',
    fontWeight: 'bold', marginBottom: 4,
  },
  step: { fontSize: 13, color: '#AAAAAA', lineHeight: 20 },
  payBtn: {
    backgroundColor: '#FCDE06', borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 8, marginTop: 8,
  },
  payBtnLoading: { backgroundColor: '#333333' },
  payBtnText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  secure: { fontSize: 12, color: '#666666', textAlign: 'center', marginTop: 12 },
});