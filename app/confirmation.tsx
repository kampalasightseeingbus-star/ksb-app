import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function ConfirmationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { scheduleId, seatNumber, amount, routeName, paymentMethod } = params;

  const handleConfirm = () => {
    const payParams = {
      scheduleId: String(scheduleId || '1'),
      seatNumber: String(seatNumber || '1'),
      amount: String(amount || '30000'),
      routeName: String(routeName || ''),
    };

    if (paymentMethod === 'mtn_momo' || paymentMethod === 'airtel_money') {
      router.push({ pathname: '/pay-mobile', params: payParams } as any);
    } else {
      router.push({ pathname: '/pay-card', params: payParams } as any);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Summary</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.successSection}>
        <View style={styles.successIcon}>
          <Ionicons name="checkmark-circle" size={80} color="#FCDE06" />
        </View>
        <Text style={styles.successTitle}>Almost There!</Text>
        <Text style={styles.successSubtitle}>Review your booking before payment</Text>
      </View>

      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Booking Details</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Tour</Text>
          <Text style={styles.detailValue}>{routeName || 'City Highlights Tour'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Seat</Text>
          <Text style={styles.detailValue}>#{seatNumber}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Payment</Text>
          <Text style={styles.detailValue}>
            {paymentMethod === 'mtn_momo' ? 'MTN Mobile Money'
              : paymentMethod === 'airtel_money' ? 'Airtel Money' : 'Card'}
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.totalUGX}>{Number(amount || 30000).toLocaleString()} UGX</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
        <Ionicons name="lock-closed" size={20} color="#000000" />
        <Text style={styles.confirmButtonText}>Confirm & Pay</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        🔒 Your payment is secure. Free cancellation up to 2 hours before departure.
      </Text>

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
  successSection: { alignItems: 'center', marginBottom: 28, gap: 8 },
  successIcon: {
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: '#1a1a1a', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: '#FCDE06', marginBottom: 8,
  },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  successSubtitle: { fontSize: 14, color: '#AAAAAA' },
  detailsCard: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20,
    marginBottom: 24, borderWidth: 1, borderColor: '#333333', gap: 12,
  },
  detailsTitle: { fontSize: 16, fontWeight: 'bold', color: '#FCDE06', marginBottom: 4 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  detailLabel: { fontSize: 14, color: '#AAAAAA' },
  detailValue: {
    fontSize: 14, color: '#FFFFFF', fontWeight: '500',
    textAlign: 'right', flex: 1, marginLeft: 16,
  },
  divider: { height: 1, backgroundColor: '#333333' },
  totalUGX: { fontSize: 16, fontWeight: 'bold', color: '#FCDE06' },
  confirmButton: {
    backgroundColor: '#FCDE06', borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, marginBottom: 16,
  },
  confirmButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  note: { fontSize: 12, color: '#AAAAAA', textAlign: 'center', lineHeight: 20 },
});