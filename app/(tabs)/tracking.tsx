import { busAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

// ─── ROUTE STOP COORDINATES ───────────────────────────────────────
const routes = [
  {
    id: 1,
    bus_id: 1,
    name: 'City Highlights Tour',
    icon: '🏙️',
    color: '#FCDE06',
    stops: [
      { id: 1, name: 'BMK House (Start)', lat: 0.3145, lng: 32.5756, isStart: true },
      { id: 2, name: 'Serena & Speke Hotel', lat: 0.3190, lng: 32.5897 },
      { id: 3, name: 'Bank of Uganda', lat: 0.3178, lng: 32.5834 },
      { id: 4, name: 'Constitution Square', lat: 0.3165, lng: 32.5812 },
      { id: 5, name: 'Post Office Building', lat: 0.3156, lng: 32.5798 },
      { id: 6, name: 'Nakasero Market', lat: 0.3123, lng: 32.5754 },
      { id: 7, name: 'Clock Tower & Kibuye', lat: 0.3063, lng: 32.5686 },
      { id: 8, name: 'Ring Road', lat: 0.3076, lng: 32.5650 },
      { id: 9, name: "Kabaka's Lake & Lubiri", lat: 0.2998, lng: 32.5589 },
      { id: 10, name: 'Bulange Parliament', lat: 0.3012, lng: 32.5560 },
      { id: 11, name: 'Lubaga Cathedral', lat: 0.3025, lng: 32.5522 },
      { id: 12, name: 'Namirembe Cathedral', lat: 0.3150, lng: 32.5597 },
      { id: 13, name: 'Café Javas Bakuli', lat: 0.3078, lng: 32.5578 },
      { id: 14, name: 'Kasubi Tombs', lat: 0.3311, lng: 32.5556 },
      { id: 15, name: 'Makerere University', lat: 0.3350, lng: 32.5689 },
      { id: 16, name: 'Uganda Museum', lat: 0.3289, lng: 32.5756 },
      { id: 17, name: 'Independence Grounds', lat: 0.3163, lng: 32.5822 },
    ],
  },
  {
    id: 2,
    bus_id: 3,
    name: 'Religious Tour',
    icon: '🕌',
    color: '#D90000',
    stops: [
      { id: 1, name: 'BMK Cafe (Start)', lat: 0.3145, lng: 32.5756, isStart: true },
      { id: 2, name: 'Lubaga Cathedral', lat: 0.3025, lng: 32.5522 },
      { id: 3, name: 'Namirembe Cathedral', lat: 0.3150, lng: 32.5597 },
      { id: 4, name: 'Gaddafi Mosque', lat: 0.3153, lng: 32.5686 },
      { id: 5, name: "Bahá'í Temple", lat: 0.3612, lng: 32.6012 },
      { id: 6, name: 'Namugongo Shrine', lat: 0.3953, lng: 32.6658 },
    ],
  },
];

// Calculate distance between two GPS coordinates in km
const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Calculate ETA based on distance from bus to stop
// Average bus speed in Kampala traffic = 20 km/h
const getETAFromDistance = (busLat: number, busLng: number, stopLat: number, stopLng: number) => {
  const distance = getDistance(busLat, busLng, stopLat, stopLng);
  const speedKmh = 20;
  const timeHours = distance / speedKmh;
  const timeMinutes = Math.round(timeHours * 60);

  if (timeMinutes < 1) return 'Arriving now';
  if (timeMinutes < 60) return `${timeMinutes} min`;
  const hours = Math.floor(timeMinutes / 60);
  const mins = timeMinutes % 60;
  return `${hours}h ${mins}min`;
};

export default function TrackingScreen() {
  const mapRef = useRef<MapView>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<any>(null);
  const [busLocation, setBusLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedStop, setSelectedStop] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const intervalRef = useRef<any>(null);

  const activeRoute = routes.find(r => r.id === Number(selectedRoute));

  useEffect(() => {
    getUserLocation();
    return () => {
      // Clean up interval when screen unmounts
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // When route is selected start fetching bus location
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (selectedRoute && activeRoute) {
      // Fetch immediately
      fetchBusLocation(activeRoute.bus_id);

      // Then fetch every 5 seconds
      intervalRef.current = setInterval(() => {
        fetchBusLocation(activeRoute.bus_id);
      }, 5000);

      // Fit map to route
      if (mapRef.current) {
        const coords = activeRoute.stops.map(s => ({
          latitude: s.lat,
          longitude: s.lng,
        }));
        mapRef.current.fitToCoordinates(coords, {
          edgePadding: { top: 80, right: 40, bottom: 300, left: 40 },
          animated: true,
        });
      }
    } else {
      setBusLocation(null);
    }
  }, [selectedRoute]);

  const fetchBusLocation = async (busId: number) => {
    try {
      const data = await busAPI.getLocation(busId);
      if (data.location) {
        setBusLocation({
          lat: parseFloat(data.location.latitude),
          lng: parseFloat(data.location.longitude),
        });
        setLastUpdated(new Date().toLocaleTimeString('en-UG', {
          hour: '2-digit', minute: '2-digit', second: '2-digit',
        }));
      }
    } catch (err) {
      // No location data yet - this is normal when bus hasn't started
      console.log('No bus location available yet');
    }
  };

  const getUserLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    }
  };

  const initialRegion = {
    latitude: 0.3136,
    longitude: 32.5811,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <Text style={styles.headerSubtitle}>
          {busLocation && lastUpdated
            ? `Updated: ${lastUpdated}`
            : 'Track your bus in real time'}
        </Text>
      </View>

      {/* Route Selector */}
      <View style={styles.routeSelector}>
        {routes.map(route => (
          <TouchableOpacity
            key={route.id}
            style={[
              styles.routeTab,
              selectedRoute === String(route.id) && {
                backgroundColor: route.color,
              },
            ]}
            onPress={() => setSelectedRoute(String(route.id))}
          >
            <Text style={styles.routeTabIcon}>{route.icon}</Text>
            <Text style={[
              styles.routeTabText,
              selectedRoute === String(route.id) && { color: '#000000' },
            ]}>
              {route.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Route line */}
        {activeRoute && (
          <Polyline
            coordinates={activeRoute.stops.map(s => ({
              latitude: s.lat,
              longitude: s.lng,
            }))}
            strokeColor={activeRoute.color}
            strokeWidth={4}
          />
        )}

        {/* Stop markers */}
        {activeRoute?.stops.map((stop, index) => (
          <Marker
            key={stop.id}
            coordinate={{ latitude: stop.lat, longitude: stop.lng }}
            title={stop.name}
            description={
              busLocation
                ? `ETA: ${getETAFromDistance(busLocation.lat, busLocation.lng, stop.lat, stop.lng)}`
                : `Stop ${index + 1}`
            }
            onPress={() => setSelectedStop(index)}
          >
            <View style={[
              styles.stopMarker,
              stop.isStart && styles.startMarker,
              selectedStop === index && styles.selectedMarker,
            ]}>
              <Text style={styles.stopMarkerText}>
                {stop.isStart ? '🟢' : index + 1}
              </Text>
            </View>
          </Marker>
        ))}

        {/* Real bus location marker */}
        {busLocation && (
          <Marker
            coordinate={{
              latitude: busLocation.lat,
              longitude: busLocation.lng,
            }}
            title="KSB Bus"
            description="Live bus location"
          >
            <View style={styles.busMarker}>
              <Text style={styles.busMarkerText}>🚌</Text>
            </View>
          </Marker>
        )}
      </MapView>

      {/* Bottom info panel */}
      {activeRoute ? (
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetTop}>
            <Text style={styles.bottomSheetTitle}>
              {activeRoute.icon} {activeRoute.name}
            </Text>
            {busLocation ? (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            ) : (
              <View style={styles.offlineBadge}>
                <Text style={styles.offlineText}>Bus not started</Text>
              </View>
            )}
          </View>

          {!busLocation && (
            <Text style={styles.noLocationText}>
              Bus location will appear here once the driver starts the trip
            </Text>
          )}

          {/* Stops with real ETA based on bus GPS */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.etaScroll}
          >
            {activeRoute.stops.map((stop, index) => {
              const eta = busLocation
                ? getETAFromDistance(busLocation.lat, busLocation.lng, stop.lat, stop.lng)
                : '--';

              return (
                <TouchableOpacity
                  key={stop.id}
                  style={[
                    styles.etaCard,
                    selectedStop === index && styles.etaCardSelected,
                  ]}
                  onPress={() => {
                    setSelectedStop(index);
                    mapRef.current?.animateToRegion({
                      latitude: stop.lat,
                      longitude: stop.lng,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }, 500);
                  }}
                >
                  <Text style={styles.etaStopNum}>{index + 1}</Text>
                  <Text style={styles.etaStopName} numberOfLines={2}>
                    {stop.name}
                  </Text>
                  <View style={[
                    styles.etaBadge,
                    eta === 'Arriving now' && styles.etaBadgeGreen,
                  ]}>
                    <Ionicons name="time-outline" size={10} color="#000000" />
                    <Text style={styles.etaTime}>{eta}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.bottomSheetEmpty}>
          <Text style={styles.emptyIcon}>🗺️</Text>
          <Text style={styles.emptyTitle}>Select a Route</Text>
          <Text style={styles.emptySubtitle}>
            Choose a tour above to see the route and track your bus live
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    backgroundColor: '#000000',
    paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16,
    borderBottomWidth: 3, borderBottomColor: '#FCDE06',
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  headerSubtitle: { fontSize: 13, color: '#CCCCCC', marginTop: 4 },
  routeSelector: {
    flexDirection: 'row', backgroundColor: '#111111',
    paddingHorizontal: 16, paddingVertical: 12, gap: 10,
  },
  routeTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#1a1a1a',
    gap: 6, borderWidth: 1, borderColor: '#333333',
  },
  routeTabIcon: { fontSize: 16 },
  routeTabText: { fontSize: 12, color: '#AAAAAA', fontWeight: '600' },
  map: { flex: 1 },
  stopMarker: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#FFFFFF', justifyContent: 'center',
    alignItems: 'center', borderWidth: 2, borderColor: '#333333',
  },
  startMarker: { borderColor: '#00CC00', borderWidth: 3 },
  selectedMarker: {
    borderColor: '#FCDE06', borderWidth: 3,
    transform: [{ scale: 1.2 }],
  },
  stopMarkerText: { fontSize: 12, fontWeight: 'bold', color: '#000000' },
  busMarker: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#000000', justifyContent: 'center',
    alignItems: 'center', borderWidth: 3, borderColor: '#FCDE06',
  },
  busMarkerText: { fontSize: 24 },
  bottomSheet: {
    backgroundColor: '#000000', paddingHorizontal: 20,
    paddingTop: 16, paddingBottom: 24,
    borderTopWidth: 3, borderTopColor: '#FCDE06', gap: 8,
  },
  bottomSheetTop: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomSheetTitle: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
  liveBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#003300', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4, gap: 6,
    borderWidth: 1, borderColor: '#00CC66',
  },
  liveDot: {
    width: 8, height: 8, borderRadius: 4, backgroundColor: '#00CC66',
  },
  liveText: { fontSize: 11, fontWeight: 'bold', color: '#00CC66' },
  offlineBadge: {
    backgroundColor: '#1a1a1a', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    borderWidth: 1, borderColor: '#333333',
  },
  offlineText: { fontSize: 11, color: '#666666' },
  noLocationText: {
    fontSize: 12, color: '#666666',
    fontStyle: 'italic', marginBottom: 4,
  },
  etaScroll: { marginTop: 4 },
  etaCard: {
    width: 120, backgroundColor: '#1a1a1a',
    borderRadius: 10, padding: 10,
    marginRight: 10, gap: 6,
    borderWidth: 1, borderColor: '#333333',
  },
  etaCardSelected: { borderColor: '#FCDE06', backgroundColor: '#111100' },
  etaStopNum: { fontSize: 12, color: '#AAAAAA' },
  etaStopName: {
    fontSize: 12, color: '#FFFFFF',
    fontWeight: '500', lineHeight: 16,
  },
  etaBadge: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FCDE06', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 3,
    gap: 4, alignSelf: 'flex-start',
  },
  etaBadgeGreen: { backgroundColor: '#00CC66' },
  etaTime: { fontSize: 10, fontWeight: 'bold', color: '#000000' },
  bottomSheetEmpty: {
    backgroundColor: '#000000', paddingHorizontal: 20,
    paddingVertical: 32, alignItems: 'center',
    borderTopWidth: 3, borderTopColor: '#FCDE06', gap: 8,
  },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  emptySubtitle: {
    fontSize: 14, color: '#AAAAAA',
    textAlign: 'center', lineHeight: 22,
  },
});