import { bookingsAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function ReceiptScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const data = await bookingsAPI.getById(Number(bookingId));
      setBooking(data.booking);
    } catch (err) {
      console.error('Fetch booking error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-UG', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FCDE06" />
        <Text style={styles.loadingText}>Loading your ticket...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Booking not found.</Text>
        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
          <Text style={{ color: '#FCDE06', marginTop: 12 }}>Go Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const qrData = JSON.stringify({
    ref: `KSB-${String(booking.id).padStart(6, '0')}`,
    qr_code: booking.qr_code,
    tour: booking.route_name,
    seat: booking.seat_number,
    departure: booking.departure_time,
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace('/(tabs)' as any)}>
          <Ionicons name="home-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Ticket</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Success Banner */}
      <View style={styles.successBanner}>
        <Ionicons name="checkmark-circle" size={48} color="#000000" />
        <View>
          <Text style={styles.successTitle}>Booking Confirmed!</Text>
          <Text style={styles.successSubtitle}>Your seat is reserved 🎉</Text>
        </View>
      </View>

      {/* QR Code */}
      <View style={styles.qrCard}>
        <Text style={styles.qrTitle}>Scan to Board</Text>
        <Text style={styles.qrSubtitle}>Show this QR code to the driver</Text>
        <View style={styles.qrContainer}>
          <QRCode value={qrData} size={200} backgroundColor="white" color="black" />
        </View>
        <View style={styles.refContainer}>
          <Text style={styles.refLabel}>Booking Reference</Text>
          <Text style={styles.refValue}>KSB-{String(booking.id).padStart(6, '0')}</Text>
        </View>
      </View>

      {/* Trip Details */}
      <View style={styles.detailsCard}>
        <Text style={styles.detailsTitle}>Trip Details</Text>
        <View style={styles.detailRow}>
          <Ionicons name="bus-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Tour</Text>
          <Text style={styles.detailValue}>{booking.route_name}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="location-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Route</Text>
          <Text style={styles.detailValue}>{booking.origin} → {booking.destination}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(booking.departure_time)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Time</Text>
          <Text style={styles.detailValue}>{formatTime(booking.departure_time)}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="car-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Bus</Text>
          <Text style={styles.detailValue}>{booking.plate_number} ({booking.model})</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="grid-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Seat</Text>
          <Text style={styles.detailValue}>#{booking.seat_number}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="card-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Payment</Text>
          <Text style={styles.detailValue}>{booking.payment_method?.replace('_', ' ').toUpperCase()}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={16} color="#AAAAAA" />
          <Text style={styles.detailLabel}>Total Paid</Text>
          <Text style={styles.totalUGX}>{Number(booking.total_amount).toLocaleString()} UGX</Text>
        </View>
      </View>

      {/* Note */}
      <View style={styles.noteCard}>
        <Ionicons name="information-circle-outline" size={20} color="#FCDE06" />
        <Text style={styles.noteText}>
          Please arrive at your pick-up stop at least 10 minutes before departure.
          Free cancellation up to 2 hours before departure.
        </Text>
      </View>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => router.replace('/(tabs)' as any)}
      >
        <Ionicons name="home" size={20} color="#000000" />
        <Text style={styles.homeButtonText}>Back to Home</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  content: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 40 },
  loadingContainer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#AAAAAA', fontSize: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  successBanner: {
    backgroundColor: '#FCDE06', borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24,
  },
  successTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  successSubtitle: { fontSize: 14, color: '#333333', marginTop: 4 },
  qrCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 20, gap: 8,
  },
  qrTitle: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
  qrSubtitle: { fontSize: 13, color: '#666666', marginBottom: 8 },
  qrContainer: {
    padding: 16, backgroundColor: '#FFFFFF', borderRadius: 12,
    borderWidth: 2, borderColor: '#F0F0F0',
  },
  refContainer: {
    alignItems: 'center', marginTop: 8, backgroundColor: '#F5F5F5',
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, width: '100%',
  },
  refLabel: { fontSize: 12, color: '#666666' },
  refValue: { fontSize: 18, fontWeight: 'bold', color: '#000000', letterSpacing: 2 },
  detailsCard: {
    backgroundColor: '#1a1a1a', borderRadius: 16, padding: 20,
    marginBottom: 16, borderWidth: 1, borderColor: '#333333', gap: 12,
  },
  detailsTitle: { fontSize: 16, fontWeight: 'bold', color: '#FCDE06', marginBottom: 4 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailLabel: { fontSize: 14, color: '#AAAAAA', flex: 1 },
  detailValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '500', textAlign: 'right' },
  totalUGX: { fontSize: 16, fontWeight: 'bold', color: '#FCDE06' },
  divider: { height: 1, backgroundColor: '#333333' },
  noteCard: {
    backgroundColor: '#111100', borderRadius: 12, padding: 16,
    flexDirection: 'row', gap: 12, borderWidth: 1,
    borderColor: '#FCDE06', marginBottom: 24, alignItems: 'flex-start',
  },
  noteText: { fontSize: 13, color: '#AAAAAA', lineHeight: 20, flex: 1 },
  homeButton: {
    backgroundColor: '#FCDE06', borderRadius: 12, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  homeButtonText: { fontSize: 18, fontWeight: 'bold', color: '#000000' },
});
