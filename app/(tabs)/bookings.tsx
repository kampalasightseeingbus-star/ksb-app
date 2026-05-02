import { bookingsAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function BookingsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'completed' | 'cancelled'>('upcoming');
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const fetchBookings = async () => {
    setError(false);
    try {
      const data = await bookingsAPI.getMyBookings();
      setBookings(data.bookings || []);
    } catch (err) {
      setError(true);
      // Don't crash — just show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCancel = (id: number) => {
    Alert.alert('Cancel Booking', 'Are you sure you want to cancel?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          try {
            await bookingsAPI.cancel(id);
            fetchBookings();
            Alert.alert('Cancelled', 'Your booking has been cancelled.');
          } catch (err: any) {
            Alert.alert('Error', err.message || 'Could not cancel booking.');
          }
        },
      },
    ]);
  };

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming') return b.status === 'confirmed';
    if (activeTab === 'completed') return b.status === 'completed';
    return b.status === 'cancelled';
  });

  const getStatusColor = (status: string) => {
    if (status === 'confirmed') return '#FCDE06';
    if (status === 'completed') return '#00CC66';
    return '#D90000';
  };

  const getStatusLabel = (status: string) => {
    if (status === 'confirmed') return 'Upcoming';
    if (status === 'completed') return 'Completed';
    return 'Cancelled';
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-UG', {
        weekday: 'short', day: 'numeric', month: 'short',
      });
    } catch { return dateStr; }
  };

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' });
    } catch { return dateStr; }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSubtitle}>Your upcoming and past tours</Text>
      </View>

      <View style={styles.tabContainer}>
        {(['upcoming', 'completed', 'cancelled'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchBookings(); }}
            tintColor="#FCDE06"
          />
        }
      >
        {error ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📡</Text>
            <Text style={styles.emptyTitle}>Connection Error</Text>
            <Text style={styles.emptySubtitle}>
              Make sure your backend is running and your IP is correct in api.ts
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchBookings}>
              <Text style={styles.retryText}>Tap to Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎫</Text>
            <Text style={styles.emptyTitle}>No {activeTab} bookings</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab === 'upcoming'
                ? 'Book a tour to get started!'
                : `You have no ${activeTab} bookings yet.`}
            </Text>
            {activeTab === 'upcoming' && (
              <TouchableOpacity
                style={styles.bookNowButton}
                onPress={() => router.push('/booking' as any)}
              >
                <Text style={styles.bookNowText}>Book a Tour</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filtered.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.tourIcon}>
                  {booking.route_name?.includes('Religious') ? '🕌' : '🏙️'}
                </Text>
                <View style={styles.cardHeaderInfo}>
                  <Text style={styles.tourName}>{booking.route_name}</Text>
                  <Text style={styles.bookingRef}>
                    Ref: KSB-{String(booking.id).padStart(6, '0')}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(booking.status) },
                ]}>
                  <Text style={styles.statusText}>{getStatusLabel(booking.status)}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Ionicons name="calendar-outline" size={14} color="#AAAAAA" />
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>{formatDate(booking.departure_time)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={14} color="#AAAAAA" />
                  <Text style={styles.detailLabel}>Time</Text>
                  <Text style={styles.detailValue}>{formatTime(booking.departure_time)}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="grid-outline" size={14} color="#AAAAAA" />
                  <Text style={styles.detailLabel}>Seat</Text>
                  <Text style={styles.detailValue}>#{booking.seat_number}</Text>
                </View>
                <View style={styles.detailItem}>
                  <Ionicons name="cash-outline" size={14} color="#AAAAAA" />
                  <Text style={styles.detailLabel}>Total</Text>
                  <Text style={styles.detailValue}>
                    {Number(booking.total_amount).toLocaleString()} UGX
                  </Text>
                </View>
              </View>

              <View style={styles.routeRow}>
                <Ionicons name="location-outline" size={14} color="#AAAAAA" />
                <Text style={styles.routeText}>
                  {booking.origin} → {booking.destination}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.actionsRow}>
                {booking.status === 'confirmed' && (
                  <>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push({
                        pathname: '/receipt',
                        params: { bookingId: booking.id },
                      } as any)}
                    >
                      <Ionicons name="qr-code-outline" size={16} color="#FCDE06" />
                      <Text style={styles.actionButtonText}>View Ticket</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push('/(tabs)/tracking' as any)}
                    >
                      <Ionicons name="location-outline" size={16} color="#FCDE06" />
                      <Text style={styles.actionButtonText}>Track Bus</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.cancelButton]}
                      onPress={() => handleCancel(booking.id)}
                    >
                      <Ionicons name="close-circle-outline" size={16} color="#D90000" />
                      <Text style={[styles.actionButtonText, { color: '#D90000' }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
                {booking.status === 'completed' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push({
                      pathname: '/receipt',
                      params: { bookingId: booking.id },
                    } as any)}
                  >
                    <Ionicons name="receipt-outline" size={16} color="#FCDE06" />
                    <Text style={styles.actionButtonText}>View Receipt</Text>
                  </TouchableOpacity>
                )}
                {booking.status === 'cancelled' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push('/booking' as any)}
                  >
                    <Ionicons name="refresh-outline" size={16} color="#FCDE06" />
                    <Text style={styles.actionButtonText}>Book Again</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#000000', paddingHorizontal: 20,
    paddingTop: 60, paddingBottom: 20,
    borderBottomWidth: 3, borderBottomColor: '#FCDE06',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#CCCCCC', marginTop: 4 },
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    paddingHorizontal: 20, paddingVertical: 12, gap: 10,
  },
  tab: {
    flex: 1, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F0F0F0', alignItems: 'center',
  },
  tabActive: { backgroundColor: '#D90000' },
  tabText: { fontSize: 13, fontWeight: '500', color: '#666666' },
  tabTextActive: { color: '#FFFFFF' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  emptyState: { alignItems: 'center', paddingTop: 80, gap: 12 },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#000000' },
  emptySubtitle: { fontSize: 14, color: '#666666', textAlign: 'center', paddingHorizontal: 20 },
  retryButton: {
    backgroundColor: '#FCDE06', borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 32, marginTop: 8,
  },
  retryText: { fontSize: 15, fontWeight: 'bold', color: '#000000' },
  bookNowButton: {
    backgroundColor: '#FCDE06', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 32, marginTop: 8,
  },
  bookNowText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  bookingCard: {
    backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16,
    marginBottom: 16, elevation: 2,
    borderWidth: 1, borderColor: '#F0F0F0', gap: 12,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tourIcon: { fontSize: 32 },
  cardHeaderInfo: { flex: 1 },
  tourName: { fontSize: 15, fontWeight: 'bold', color: '#000000' },
  bookingRef: { fontSize: 12, color: '#666666', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  divider: { height: 1, backgroundColor: '#F0F0F0' },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  detailItem: { width: '45%', gap: 2 },
  detailLabel: { fontSize: 11, color: '#AAAAAA' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#000000' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeText: { fontSize: 13, color: '#666666' },
  actionsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  actionButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#F8F8F8', paddingHorizontal: 12,
    paddingVertical: 8, borderRadius: 8,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  cancelButton: { borderColor: '#FFCCCC' },
  actionButtonText: { fontSize: 13, color: '#FCDE06', fontWeight: '500' },
});