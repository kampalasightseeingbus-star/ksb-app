import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Replace YOUR_PC_IP with your actual IP from running ipconfig in CMD
export const BASE_URL = 'https://ksb-app-backend-production.up.railway.app/api';

// ─── Token Helpers ────────────────────────────────────────────────
export const saveToken = async (token: string) => {
  await AsyncStorage.setItem('ksb_token', token);
};
export const getToken = async () => {
  return await AsyncStorage.getItem('ksb_token');
};
export const removeToken = async () => {
  await AsyncStorage.removeItem('ksb_token');
};
export const saveUser = async (user: any) => {
  await AsyncStorage.setItem('ksb_user', JSON.stringify(user));
};
export const getUser = async () => {
  const user = await AsyncStorage.getItem('ksb_user');
  return user ? JSON.parse(user) : null;
};
export const removeUser = async () => {
  await AsyncStorage.removeItem('ksb_user');
};

// ─── Base Request ─────────────────────────────────────────────────
const request = async (endpoint: string, options: any = {}) => {
  const token = await getToken();
  const headers: any = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

// ─── AUTH ─────────────────────────────────────────────────────────
export const authAPI = {
  // Registration - Step 1: send OTP
  sendRegisterOTP: async (first_name: string, last_name: string, phone: string) =>
    request('/auth/register/send-otp', {
      method: 'POST',
      body: JSON.stringify({ first_name, last_name, phone }),
    }),

  // Registration - Step 2: verify OTP and create account
  verifyRegisterOTP: async (phone: string, otp: string) => {
    const data = await request('/auth/register/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    await saveToken(data.token);
    await saveUser(data.user);
    return data;
  },

  // Login - Step 1: send OTP
  sendLoginOTP: async (phone: string) =>
    request('/auth/login/send-otp', {
      method: 'POST',
      body: JSON.stringify({ phone }),
    }),

  // Login - Step 2: verify OTP and log in
  verifyLoginOTP: async (phone: string, otp: string) => {
    const data = await request('/auth/login/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ phone, otp }),
    });
    await saveToken(data.token);
    await saveUser(data.user);
    return data;
  },

  getProfile: async () => request('/auth/profile'),

  updateProfile: async (full_name: string, email: string) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify({ full_name, email }),
    }),

  logout: async () => {
    await removeToken();
    await removeUser();
  },
};

// ─── ROUTES ───────────────────────────────────────────────────────
export const routesAPI = {
  getAll: async () => request('/routes'),
  getSchedules: async (routeId: number) => request(`/routes/${routeId}/schedules`),
};

// ─── BOOKINGS ─────────────────────────────────────────────────────
export const bookingsAPI = {
  create: async (schedule_id: number, seat_number: number, payment_method: string) =>
    request('/bookings', {
      method: 'POST',
      body: JSON.stringify({ schedule_id, seat_number, payment_method }),
    }),
  getMyBookings: async () => request('/bookings/my'),
  getById: async (id: number) => request(`/bookings/${id}`),
  cancel: async (id: number) => request(`/bookings/${id}/cancel`, { method: 'PUT' }),
  getBookedSeats: async (schedule_id: number) => request(`/bookings/seats/${schedule_id}`),
};

// ─── BUS ──────────────────────────────────────────────────────────
export const busAPI = {
  getLocation: async (bus_id: number) => request(`/buses/${bus_id}/location`),
};
// ─── NOTIFICATIONS ────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: async () => request('/notifications'),
  markRead: async (id: number) =>
    request(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllRead: async () =>
    request('/notifications/read-all', { method: 'PUT' }),
};
// ─── PAYMENTS API ─────────────────────────────────────────────────
export const paymentsAPI = {
  // Initiate payment - creates booking and gets Pesapal redirect URL
  initiate: async (
    schedule_id: number,
    seat_number: number,
    payment_method: string,
    currency: string,
    passengers: number
  ) =>
    request('/payments/initiate', {
      method: 'POST',
      body: JSON.stringify({
        schedule_id,
        seat_number,
        payment_method,
        currency,
        passengers,
      }),
    }),

  // Verify payment after user returns from Pesapal
  verify: async (order_tracking_id: string, booking_id: number) =>
    request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify({ order_tracking_id, booking_id }),
    }),

  // Get all payments for logged in user
  getMyPayments: async () => request('/payments/my'),
};
export default {};