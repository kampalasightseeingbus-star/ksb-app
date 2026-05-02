import { notificationsAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getAll();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      fetchNotifications();
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      await notificationsAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  const getIcon = (title: string) => {
    if (title.includes('Confirmed') || title.includes('confirmed')) return { name: 'checkmark-circle', color: '#00CC66' };
    if (title.includes('Approaching') || title.includes('approaching')) return { name: 'bus', color: '#FCDE06' };
    if (title.includes('Arrived') || title.includes('arrived')) return { name: 'location', color: '#FCDE06' };
    if (title.includes('Completed') || title.includes('completed')) return { name: 'flag', color: '#00CC66' };
    if (title.includes('Payment') || title.includes('payment')) return { name: 'card', color: '#FCDE06' };
    if (title.includes('Welcome') || title.includes('welcome')) return { name: 'star', color: '#FCDE06' };
    return { name: 'notifications', color: '#FCDE06' };
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-UG', { day: 'numeric', month: 'short' });
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={handleMarkAllRead}>
          <Text style={styles.markAllText}>Mark all read</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FCDE06" />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchNotifications(); }}
              tintColor="#FCDE06"
            />
          }
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                We'll notify you when your bus is approaching and when bookings are confirmed.
              </Text>
            </View>
          ) : (
            notifications.map((notif) => {
              const icon = getIcon(notif.title);
              return (
                <TouchableOpacity
                  key={notif.id}
                  style={[
                    styles.notifCard,
                    !notif.is_read && styles.notifCardUnread,
                  ]}
                  onPress={() => handleMarkRead(notif.id)}
                >
                  <View style={[styles.iconCircle, { backgroundColor: icon.color + '22' }]}>
                    <Ionicons name={icon.name as any} size={24} color={icon.color} />
                  </View>
                  <View style={styles.notifContent}>
                    <View style={styles.notifHeader}>
                      <Text style={styles.notifTitle}>{notif.title}</Text>
                      {!notif.is_read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                    <Text style={styles.notifTime}>{formatTime(notif.created_at)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 30 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 60,
    paddingBottom: 20, borderBottomWidth: 3,
    borderBottomColor: '#FCDE06',
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  unreadBadge: {
    backgroundColor: '#D90000', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  unreadBadgeText: { fontSize: 12, fontWeight: 'bold', color: '#FFFFFF' },
  markAllText: { fontSize: 13, color: '#FCDE06' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  emptyState: {
    alignItems: 'center', paddingTop: 80, gap: 12, paddingHorizontal: 32,
  },
  emptyIcon: { fontSize: 64 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  emptySubtitle: { fontSize: 14, color: '#AAAAAA', textAlign: 'center', lineHeight: 22 },
  notifCard: {
    flexDirection: 'row', gap: 12, padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#1a1a1a',
  },
  notifCardUnread: { backgroundColor: '#0a0a00' },
  iconCircle: {
    width: 48, height: 48, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center',
  },
  notifContent: { flex: 1, gap: 4 },
  notifHeader: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifTitle: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  unreadDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#FCDE06',
  },
  notifMessage: { fontSize: 13, color: '#AAAAAA', lineHeight: 18 },
  notifTime: { fontSize: 11, color: '#555555' },
});