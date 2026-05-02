import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const { width } = Dimensions.get('window');

const carouselImages = [
  { id: '1', source: require('@/assets/images/bus1.jpeg') },
  { id: '2', source: require('@/assets/images/bus2.jpeg') },
  { id: '3', source: require('@/assets/images/bus3.jpeg') },
];

const tours = [
  {
    id: 'city_tour',
    name: 'City Highlights Tour',
    price: { ugx: 50000, usd: 35 },
    duration: '4 hours',
    stops: 17,
  },
  {
    id: 'sacred_sites',
    name: 'Religious Tour',
    price: { ugx: 50000, usd: 35 },
    duration: '3 hours',
    stops: 6,
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (activeIndex + 1) % carouselImages.length;
      setActiveIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 5000);
    return () => clearInterval(interval);
  }, [activeIndex]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Bus Image Carousel */}
        <View style={styles.busImageContainer}>
          <FlatList
            ref={flatListRef}
            data={carouselImages}
            horizontal
            pagingEnabled
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Image
                source={item.source}
                style={styles.busImage}
                resizeMode="cover"
              />
            )}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setActiveIndex(index);
            }}
          />
          {/* Dots */}
          <View style={styles.dotsContainer}>
            {carouselImages.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  activeIndex === index && styles.dotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Welcome Text */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Aboard 👋</Text>
          <Text style={styles.welcomeSubtitle}>Explore Kampala like never before</Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/booking' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="flash" size={28} color="#FCDE06" />
            </View>
            <Text style={styles.quickActionText}>Book Now</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/tracking' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="location" size={28} color="#FCDE06" />
            </View>
            <Text style={styles.quickActionText}>Track your Bus</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionCard}
            onPress={() => router.push('/(tabs)/routes' as any)}
          >
            <View style={styles.quickActionIcon}>
              <Ionicons name="map" size={28} color="#FCDE06" />
            </View>
            <Text style={styles.quickActionText}>Our Routes</Text>
          </TouchableOpacity>
        </View>

        {/* Tours */}
        <Text style={styles.sectionTitle}>Available Tours</Text>
        {tours.map((tour) => (
          <TouchableOpacity
            key={tour.id}
            style={styles.tourCard}
            onPress={() => router.push('/(tabs)/routes' as any)}
          >
            <View style={styles.tourLeft}>
              <Text style={styles.tourIcon}>
                {tour.id === 'city_tour' ? '🏙️' : '🕌'}
              </Text>
              <View>
                <Text style={styles.tourName}>{tour.name}</Text>
                <View style={styles.tourMeta}>
                  <Text style={styles.tourMetaText}>🕐 {tour.duration}</Text>
                  <Text style={styles.tourMetaText}>📍 {tour.stops} stops</Text>
                </View>
              </View>
            </View>
            <View style={styles.tourRight}>
              <Text style={styles.tourPriceUgx}>{tour.price.ugx.toLocaleString()} UGX</Text>
              <Text style={styles.tourPriceUsd}>${tour.price.usd} USD</Text>
            </View>
          </TouchableOpacity>
        ))}

        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
busImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#000000',
    overflow: 'hidden',
    padding: 10,
    borderRadius: 16,
    marginTop: 10,
    marginHorizontal: 0,
  },
  busImage: {
    width: width - 20,
    height: 250,
    resizeMode: 'cover',
  },
  dotsContainer: {
    position: 'absolute',
    bottom: 12,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FCDE06',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#000000',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FCDE06',
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 4,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
    backgroundColor: '#111111',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  tourCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#D90000',
  },
  tourLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tourIcon: { fontSize: 32 },
  tourName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  tourMeta: { flexDirection: 'row', gap: 12 },
  tourMetaText: { fontSize: 12, color: '#666666' },
  tourRight: { alignItems: 'flex-end' },
  tourPriceUgx: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
  },
  tourPriceUsd: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
});