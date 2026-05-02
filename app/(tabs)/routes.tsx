import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const routesData = [
  {
    id: 'city_tour',
    name: 'City Highlights Tour',
    durationText: '4 hours',
    totalStops: 17,
    price: { ugx: 50000, usd: 35 },
    busType: 'Double-decker',
    capacity: 50,
    schedule: ['9:00 AM', '2:00 PM'],
    startingPoint: 'BMK House, Colville Street',
    endingPoint: 'BMK House, Colville Street',
    description: 'Explore all major Kampala landmarks from a double-decker bus.',
    stops: [
      { order: 1, name: 'BMK House', duration: 15 },
      { order: 2, name: 'Serena Hotel & Speke Hotel Area', duration: 10, photoStop: true },
      { order: 3, name: 'Bank of Uganda & Kampala Road', duration: 10, photoStop: true },
      { order: 4, name: 'Constitution Square & Kampala Boulevard', duration: 10, photoStop: true },
      { order: 5, name: 'Post Office Building', duration: 10, photoStop: true },
      { order: 6, name: 'Entebbe Road towards Nakasero Market', duration: 15, photoStop: true },
      { order: 7, name: 'Clock Tower & Kibuye Market', duration: 10, photoStop: true },
      { order: 8, name: 'Ring Road', duration: 5 },
      { order: 9, name: "Kabaka's Lake & Lubiri (King's Palace)", duration: 15, photoStop: true },
      { order: 10, name: 'The Royal Mile, Bulange (Buganda Parliament)', duration: 15, photoStop: true },
      { order: 11, name: 'Lubaga Cathedral', duration: 20, photoStop: true },
      { order: 12, name: 'Namirembe Cathedral', duration: 20, photoStop: true },
      { order: 13, name: 'Café Javas in Bakuli (Refreshment Stop)', duration: 30 },
      { order: 14, name: 'Kasubi Tombs (UNESCO World Heritage Site)', duration: 25, photoStop: true },
      { order: 15, name: 'Makerere University / Wandegeya / Mulago', duration: 15, photoStop: true },
      { order: 16, name: 'Uganda Museum & Acacia Mall', duration: 20, photoStop: true },
      { order: 17, name: 'Independence Grounds', duration: 10, photoStop: true },
    ],
  },
  {
    id: 'religous_tour',
    name: 'Religious Tour',
    durationText: '3 hours',
    totalStops: 6,
    price: { ugx: 50000, usd: 35 },
    busType: 'Double-decker',
    capacity: 50,
    schedule: ['9:00 AM'],
    startingPoint: 'BMK Cafe, Colville Street',
    endingPoint: 'BMK Cafe, Colville Street',
    description: "Discover Kampala's most religous and spiritual sites across different faiths.",
    stops: [
      { order: 1, name: 'BMK Cafe', duration: 15 },
      { order: 2, name: "Lubaga Cathedral (St. Mary's Cathedral Rubaga)", duration: 30, photoStop: true },
      { order: 3, name: "Namirembe Cathedral (St. Paul's Cathedral)", duration: 30, photoStop: true },
      { order: 4, name: 'Gaddafi National Mosque (Old Kampala)', duration: 45, photoStop: true, entryFee: 5000 },
      { order: 5, name: "Bahá'í Temple (Mother Temple of Africa)", duration: 30, photoStop: true },
      { order: 6, name: 'Namugongo Martyrs Shrine', duration: 45, photoStop: true },
    ],
  },
];

export default function RoutesScreen() {
  const router = useRouter();
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'city' | 'religous'>('all');
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getFilteredRoutes = () => {
    if (activeTab === 'city') return routesData.filter(r => r.id === 'city_tour');
    if (activeTab === 'religous') return routesData.filter(r => r.id === 'religous_tour');
    return routesData;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Our Routes</Text>
        <Text style={styles.headerSubtitle}>Choose your sightseeing adventure</Text>
      </View>

      <View style={styles.tabContainer}>
        {['all', 'city', 'religous'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'all' ? 'All Routes' : tab === 'city' ? 'City Tour' : 'Religious Tour'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {getFilteredRoutes().map((route) => (
          <TouchableOpacity
            key={route.id}
            style={[styles.routeCard, selectedRoute === route.id && styles.routeCardSelected]}
            onPress={() => setSelectedRoute(route.id)}
            activeOpacity={0.9}
          >
            {/* Card Header */}
            <View style={styles.cardHeader}>
              <View style={styles.headerLeft}>
                <View style={styles.routeIconContainer}>
                  <Ionicons
                    name={route.id === 'city_tour' ? 'business' : 'business-outline'}
                    size={24}
                    color="#FCDE06"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <View style={styles.routeBadges}>
                    <View style={styles.badge}>
                      <Ionicons name="time-outline" size={12} color="#666" />
                      <Text style={styles.badgeText}>{route.durationText}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Ionicons name="location-outline" size={12} color="#666" />
                      <Text style={styles.badgeText}>{route.totalStops} stops</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.priceUgx}>{route.price.ugx.toLocaleString()} UGX</Text>
                <Text style={styles.priceUsd}>${route.price.usd} USD</Text>
              </View>
            </View>

            <Text style={styles.routeDescription}>{route.description}</Text>

            {/* Expand Stops */}
            <TouchableOpacity
              style={styles.expandButton}
              onPress={() => setExpandedRoute(expandedRoute === route.id ? null : route.id)}
            >
              <Text style={styles.expandButtonText}>
                {expandedRoute === route.id ? 'Hide Stops' : `View ${route.totalStops} Stops`}
              </Text>
              <Ionicons
                name={expandedRoute === route.id ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#D90000"
              />
            </TouchableOpacity>

            {expandedRoute === route.id && (
              <View style={styles.stopsList}>
                {route.stops.map((stop, index) => (
                  <View key={index} style={styles.stopItem}>
                    <View style={styles.stopNumberContainer}>
                      <View style={styles.stopNumberCircle}>
                        <Text style={styles.stopNumber}>{stop.order}</Text>
                      </View>
                      {index < route.stops.length - 1 && <View style={styles.stopLine} />}
                    </View>
                    <View style={styles.stopDetails}>
                      <Text style={styles.stopName}>{stop.name}</Text>
                      <View style={styles.stopMeta}>
                        {stop.duration && (
                          <View style={styles.stopMetaItem}>
                            <Ionicons name="time-outline" size={12} color="#999" />
                            <Text style={styles.stopMetaText}>{stop.duration} min</Text>
                          </View>
                        )}
                        {stop.photoStop && (
                          <View style={styles.stopMetaItem}>
                            <Ionicons name="camera-outline" size={12} color="#D90000" />
                            <Text style={[styles.stopMetaText, { color: '#D90000' }]}>Photo stop</Text>
                          </View>
                        )}
                        {stop.entryFee && (
                          <View style={styles.stopMetaItem}>
                            <Ionicons name="ticket-outline" size={12} color="#FCDE06" />
                            <Text style={styles.stopMetaText}>{stop.entryFee.toLocaleString()} UGX entry</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Schedule */}
            <View style={styles.scheduleContainer}>
              <Ionicons name="calendar-outline" size={14} color="#666" />
              <Text style={styles.scheduleText}>
                Departs: {route.schedule.join(' & ')}
              </Text>
            </View>

            {/* Start/End */}
            <View style={styles.startEnd}>
              <Text style={styles.startEndText}>🟢 {route.startingPoint}</Text>
              <Text style={styles.startEndText}>🔴 {route.endingPoint}</Text>
            </View>

            {/* Book Button */}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={() => router.push('/booking' as any)}
            >
              <Text style={styles.bookButtonText}>
                Book Now 
              </Text>
              <Ionicons name="arrow-forward" size={20} color="#000" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#FCDE06',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 14, color: '#CCCCCC', marginTop: 4 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  tabActive: { backgroundColor: '#D90000' },
  tabText: { fontSize: 14, fontWeight: '500', color: '#666666' },
  tabTextActive: { color: '#FFFFFF' },
  scrollView: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
  routeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    gap: 12,
  },
  routeCardSelected: { borderColor: '#D90000', borderWidth: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
  routeIconContainer: {
    width: 50, height: 50, borderRadius: 25,
    backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center',
  },
  routeName: { fontSize: 16, fontWeight: 'bold', color: '#000000', marginBottom: 4 },
  routeBadges: { flexDirection: 'row', gap: 8 },
  badge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F5F5', paddingHorizontal: 8,
    paddingVertical: 4, borderRadius: 12, gap: 4,
  },
  badgeText: { fontSize: 11, color: '#666666' },
  priceContainer: { alignItems: 'flex-end' },
  priceUgx: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
  priceUsd: { fontSize: 13, color: '#666666' },
  routeDescription: { fontSize: 13, color: '#666666', lineHeight: 20 },
  expandButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: '#F8F8F8',
    borderRadius: 8, gap: 8,
  },
  expandButtonText: { fontSize: 14, color: '#D90000', fontWeight: '500' },
  stopsList: { gap: 8 },
  stopItem: { flexDirection: 'row', marginBottom: 8 },
  stopNumberContainer: { alignItems: 'center', marginRight: 12 },
  stopNumberCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#FCDE06', justifyContent: 'center', alignItems: 'center',
  },
  stopNumber: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  stopLine: { width: 2, height: 30, backgroundColor: '#E0E0E0', marginTop: 2 },
  stopDetails: { flex: 1 },
  stopName: { fontSize: 14, fontWeight: '500', color: '#333333', marginBottom: 4 },
  stopMeta: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  stopMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stopMetaText: { fontSize: 11, color: '#999999' },
  scheduleContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scheduleText: { fontSize: 13, color: '#666666' },
  startEnd: { gap: 4, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  startEndText: { fontSize: 12, color: '#666666' },
  bookButton: {
    backgroundColor: '#FCDE06', borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  bookButtonText: { fontSize: 16, fontWeight: 'bold', color: '#000000' },
});