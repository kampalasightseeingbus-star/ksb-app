import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { BASE_URL, getToken } from './api';

// Configure how notifications appear when app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotifications = async () => {
  // Check if running in Expo Go
  const isExpoGo = Constants.appOwnership === 'expo';

  if (isExpoGo) {
    // Push notifications don't work in Expo Go SDK 53+
    // They will work when we build the proper app with EAS
    console.log('Push notifications disabled in Expo Go - will work in production build');
    return null;
  }

  // Only works on real devices
  if (!Device.isDevice) {
    console.log('Push notifications only work on real devices');
    return null;
  }

  try {
    // Ask user for permission
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permission denied');
      return null;
    }

    // Get Expo project ID from app config
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.log('No Expo project ID found - skipping push registration');
      return null;
    }

    // Get device push token
    const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
    const fcmToken = tokenData.data;

    // Save token to backend
    const authToken = await getToken();
    if (authToken && fcmToken) {
      await fetch(`${BASE_URL}/auth/fcm-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: fcmToken }),
      });
      console.log('FCM token saved to backend');
    }

    // Create Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('ksb_notifications', {
        name: 'KSB Notifications',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FCDE06',
        sound: 'default',
      });
    }

    return fcmToken;
  } catch (err) {
    console.error('Register push notifications error:', err);
    return null;
  }
};