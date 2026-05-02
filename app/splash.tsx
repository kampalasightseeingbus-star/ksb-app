import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  StatusBar,
  StyleSheet,
  View,
} from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const hasNavigated = useRef(false);

  const logoOpacity     = useRef(new Animated.Value(0)).current;
  const logoScale       = useRef(new Animated.Value(0.3)).current;
  const titleOpacity    = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const bgScale         = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Logo pops in
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1, duration: 600,
          easing: Easing.out(Easing.cubic), useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1, friction: 5, tension: 60, useNativeDriver: true,
        }),
      ]),
      // 2. Subtitle fades in
      Animated.delay(200),
      Animated.timing(titleOpacity, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
      // 3. Hold
      Animated.delay(1500),
      // 4. Exit — same as your original
      Animated.parallel([
        Animated.timing(bgScale, {
          toValue: 1.1, duration: 400, useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true,
        }),
        Animated.timing(titleOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 0, duration: 300, useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      navigate();
    });
  }, []);

  const navigate = async (): Promise<void> => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const token = await AsyncStorage.getItem('ksb_token');
      const user  = await AsyncStorage.getItem('ksb_user');

      if (token && user) {
        try {
          const response = await fetch(`${require('../lib/api').BASE_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            router.replace('/(tabs)' as any);
          } else {
            await AsyncStorage.removeItem('ksb_token');
            await AsyncStorage.removeItem('ksb_user');
            router.replace('/register' as any);
          }
        } catch (err) {
          router.replace('/(tabs)' as any);
        }
      } else {
        router.replace('/register' as any);
      }
    } catch (err) {
      router.replace('/register' as any);
    }
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: bgScale }] }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <View style={styles.content}>

        {/* Actual logo image */}
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          }}
        >
          <Image
            source={require('../assets/images/logo.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
          Explore the Pearl of Africa 🇺🇬
        </Animated.Text>

      </View>

      {/* Uganda flag accent bars */}
      <View style={styles.bottomBar}>
        <View style={styles.redBar} />
        <View style={styles.yellowBar} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  logo: {
    width: 280,
    height: 280,
  },
  subtitle: {
    fontSize: 14,
    color: '#7a6040',
    textAlign: 'center',
    fontFamily: 'serif',
    letterSpacing: 1,
  },
  bottomBar: {
    flexDirection: 'row',
    height: 6,
  },
  redBar:    { flex: 1, backgroundColor: '#D90000' },
  yellowBar: { flex: 1, backgroundColor: '#FCDE06' },
});