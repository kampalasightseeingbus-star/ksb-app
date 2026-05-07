import { routesAPI } from '@/lib/api';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ─── STOPS FOR EACH TOUR ──────────────────────────────────────────
const ROUTE_STOPS: Record<string, string[]> = {
  'City Highlights Tour': [
    'BMK House (Start)',
    'Serena Hotel & Speke Hotel',
    'Bank of Uganda & Kampala Road',
    'Constitution Square',
    'Post Office Building',
    'Nakasero Market',
    'Clock Tower & Kibuye Market',
    'Ring Road',
    "Kabaka's Lake & Lubiri",
    'Bulange Parliament',
    'Lubaga Cathedral',
    'Namirembe Cathedral',
    'Café Javas Bakuli',
    'Kasubi Tombs',
    'Makerere University',
    'Uganda Museum & Acacia Mall',
    'Independence Grounds',
  ],
  'Religious Tour': [
    'BMK Cafe (Start)',
    'Lubaga Cathedral',
    'Namirembe Cathedral',
    'Gaddafi National Mosque',
    "Bahá'í Temple",
    'Namugongo Martyrs Shrine',
  ],
};

// ─── FALLBACK ROUTES if backend is unreachable ────────────────────
const FALLBACK_ROUTES = [
  {
    id: 1,
    name: 'City Highlights Tour',
    origin: 'BMK House',
    destination: 'Independence Grounds',
    duration_minutes: 240,
    price_ugx: 50000,
    price_usd: 35,
    total_seats: 30,
  },
  {
    id: 2,
    name: 'Religious Tour',
    origin: 'BMK Cafe',
    destination: 'Namugongo Shrine',
    duration_minutes: 180,
    price_ugx: 50000,
    price_usd: 35,
    total_seats: 30,
  },
];

// ─── GENERATE NEXT 30 DAYS FOR CALENDAR ───────────────────────────
const generateDays = () => {
  const days = [];
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    days.push({
      date,
      label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : '',
      dayName: date.toLocaleDateString('en-UG', { weekday: 'short' }),
      dayNumber: date.getDate(),
      monthName: date.toLocaleDateString('en-UG', { month: 'short' }),
      fullDate: date.toISOString().split('T')[0],
    });
  }
  return days;
};

const ALL_DAYS = generateDays();
const ALL_HOURS = ['09:00', '14:00'];

export default function BookingScreen() {
  const router = useRouter();

  // State for routes list
  const [routes, setRoutes] = useState<any[]>(FALLBACK_ROUTES);
  const [loadingRoutes, setLoadingRoutes] = useState(true);

  // [CHANGED] Multiple routes can now be selected simultaneously
  // Instead of a single selectedRoute, we now keep an array of all selected routes
  const [selectedRoutes, setSelectedRoutes] = useState<any[]>([]);

  // [CHANGED] Each route has its own details stored in an object keyed by route ID
  // This allows independent selection of stops, days, times etc. for each route
  const [routeDetails, setRouteDetails] = useState<
    Record<
      number,
      {
        stop: string | null;
        day: any;
        time: string | null;
      }
    >
  >({});

  // [KEPT] These remain global settings that apply to all routes collectively
  const [passengers, setPassengers] = useState(1);
  const [currency, setCurrency] = useState<'ugx' | 'usd' | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  // [CHANGED] Modal states now need to track which route we're modifying
  // Added activeRouteId to know which route's details we're editing
  const [activeRouteId, setActiveRouteId] = useState<number | null>(null);
  const [showStopModal, setShowStopModal] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const data = await routesAPI.getAll();
      if (data.routes?.length > 0) {
        // Add price_usd to each route
        const withUSD = data.routes.map((r: any) => ({
          ...r,
          price_usd: 35,
        }));
        setRoutes(withUSD);
      }
    } catch {
      console.log('Using fallback routes');
    } finally {
      setLoadingRoutes(false);
    }
  };

  // [CHANGED] Instead of resetting, this now ADDS routes to the selection
  const handleSelectRoute = (route: any) => {
    // Check if this route is already selected
    const isAlreadySelected = selectedRoutes.some((r) => r.id === route.id);

    if (isAlreadySelected) {
      // [NEW] If route is already selected, REMOVE it (toggle behavior)
      setSelectedRoutes((prev) => prev.filter((r) => r.id !== route.id));

      // Also remove its details from routeDetails
      setRouteDetails((prev) => {
        const newDetails = { ...prev };
        delete newDetails[route.id];
        return newDetails;
      });
    } else {
      // [NEW] Add the new route to the array (alongside any existing selections)
      setSelectedRoutes((prev) => [...prev, route]);

      // [NEW] Initialize empty details for this new route
      // We don't reset other routes' details - each route maintains its own state
      setRouteDetails((prev) => ({
        ...prev,
        [route.id]: {
          stop: null,
          day: null,
          time: null,
        },
      }));
    }
  };

  // [NEW] Helper function to get stops for a specific route
  const getStops = (route: any) => {
    if (!route) return [];
    return ROUTE_STOPS[route.name] || [];
  };

  // [NEW] Helper function to update a specific route's detail
  const updateRouteDetail = (routeId: number, field: string, value: any) => {
    setRouteDetails((prev) => ({
      ...prev,
      [routeId]: {
        ...prev[routeId],
        [field]: value,
      },
    }));
  };

  // [CHANGED] Calculate total amount across ALL selected routes
  const getAmount = () => {
    if (selectedRoutes.length === 0 || !currency) return 0;

    return selectedRoutes.reduce((total, route) => {
      const base = currency === 'ugx' ? route.price_ugx : route.price_usd;
      return total + base * passengers;
    }, 0);
  };

  const getCurrencySymbol = () => (currency === 'usd' ? '$' : 'UGX');

  // [NEW] Check if all selected routes have complete details
  const areAllRoutesComplete = () => {
    if (selectedRoutes.length === 0) return false;

    return selectedRoutes.every((route) => {
      const details = routeDetails[route.id];
      return details?.stop && details?.day && details?.time;
    });
  };

  const handleProceed = () => {
    if (selectedRoutes.length === 0) {
      Alert.alert('Incomplete', 'Please select at least one tour.');
      return;
    }

    // Check each route has complete details
    const incompleteRoutes = selectedRoutes.filter((route) => {
      const details = routeDetails[route.id];
      return !details?.stop || !details?.day || !details?.time;
    });

    if (incompleteRoutes.length > 0) {
      Alert.alert(
        'Incomplete',
        `Please complete all details for: ${incompleteRoutes.map((r) => r.name).join(', ')}`
      );
      return;
    }

    if (!currency) {
      Alert.alert('Incomplete', 'Please select Local (UGX) or International (USD).');
      return;
    }
    if (!selectedPayment) {
      Alert.alert('Incomplete', 'Please select a payment method.');
      return;
    }

    // [CHANGED] Create booking parameters for multiple routes
    const params = {
      // Send all routes with their individual details
      routes: selectedRoutes.map((route) => ({
        routeId: route.id,
        routeName: route.name,
        stopName: routeDetails[route.id].stop,
        day: routeDetails[route.id].day.fullDate,
        time: routeDetails[route.id].time,
      })),
      amount: String(getAmount()),
      currency: currency.toUpperCase(),
      passengers: String(passengers),
      paymentMethod: selectedPayment,
    };

    if (selectedPayment === 'mtn_momo' || selectedPayment === 'airtel_money') {
      router.push({ pathname: '/pay-mobile', params } as any);
    } else {
      router.push({ pathname: '/pay-card', params } as any);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book a Tour</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── STEP 1: SELECT TOUR(S) ─────────────────────────── */}
        <Text style={styles.stepTitle}>1. Select Tour(s) - Multi-Select Enabled</Text>
        {loadingRoutes ? (
          <ActivityIndicator color="#FCDE06" style={{ marginVertical: 20 }} />
        ) : (
          routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              style={[
                styles.routeCard,
                // [CHANGED] Check if route is in selectedRoutes array
                selectedRoutes.some((r) => r.id === route.id) && styles.cardSelected,
              ]}
              onPress={() => handleSelectRoute(route)}
            >
              <View style={styles.routeLeft}>
                <Text style={styles.routeEmoji}>
                  {route.name?.includes('Religious') ? '🕌' : '🏙️'}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.routeName}>{route.name}</Text>
                  <Text style={styles.routeMeta}>
                    🕐 {route.duration_minutes} min · {route.origin} → {route.destination}
                  </Text>
                  <View style={styles.pricePills}>
                    <View style={styles.pricePill}>
                      <Text style={styles.pricePillText}>
                        UGX {Number(route.price_ugx).toLocaleString()}
                      </Text>
                    </View>
                    <View style={[styles.pricePill, styles.pricePillUSD]}>
                      <Text style={styles.pricePillText}>${route.price_usd} USD</Text>
                    </View>
                  </View>
                </View>
              </View>
              {selectedRoutes.some((r) => r.id === route.id) && (
                <Ionicons
                  name="checkmark-circle"
                  size={22}
                  color="#FCDE06"
                  style={styles.checkIcon}
                />
              )}
            </TouchableOpacity>
          ))
        )}

        {/* [NEW] Display selected routes count and details */}
        {selectedRoutes.length > 0 && (
          <View style={styles.selectedCountBanner}>
            <Text style={styles.selectedCountText}>
              📋 {selectedRoutes.length} tour{selectedRoutes.length > 1 ? 's' : ''} selected
            </Text>
          </View>
        )}

        {/* ── STEP 2: SELECT PICK-UP STOPS ──────────────────── */}
        {/* [CHANGED] Loop through each selected route to show its own stop picker */}
        {selectedRoutes.map((route) => (
          <View key={`stop-${route.id}`}>
            <Text style={styles.stepTitle}>2. Pick-up Stop for {route.name}</Text>
            <TouchableOpacity
              style={styles.selectorBtn}
              onPress={() => {
                setActiveRouteId(route.id);
                setShowStopModal(true);
              }}
            >
              <Ionicons name="location-outline" size={20} color="#FCDE06" />
              <Text
                style={[
                  styles.selectorText,
                  routeDetails[route.id]?.stop && styles.selectorTextSelected,
                ]}
              >
                {routeDetails[route.id]?.stop || 'Tap to choose your stop'}
              </Text>
              <Ionicons name="chevron-down" size={18} color="#666666" />
            </TouchableOpacity>
          </View>
        ))}

        {/* ── STEP 3: SELECT DATES ──────────────────────────── */}
        {/* [CHANGED] Loop through each selected route for date selection */}
        {selectedRoutes.map((route) =>
          routeDetails[route.id]?.stop ? (
            <View key={`date-${route.id}`}>
              <Text style={styles.stepTitle}>3. Select Date for {route.name}</Text>
              <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => {
                  setActiveRouteId(route.id);
                  setShowCalendarModal(true);
                }}
              >
                <Ionicons name="calendar-outline" size={20} color="#FCDE06" />
                <Text
                  style={[
                    styles.selectorText,
                    routeDetails[route.id]?.day && styles.selectorTextSelected,
                  ]}
                >
                  {routeDetails[route.id]?.day
                    ? `${routeDetails[route.id].day.dayName} ${routeDetails[route.id].day.dayNumber} ${routeDetails[route.id].day.monthName}${routeDetails[route.id].day.label ? ` (${routeDetails[route.id].day.label})` : ''}`
                    : 'Tap to choose date'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666666" />
              </TouchableOpacity>
            </View>
          ) : null
        )}

        {/* ── STEP 4: SELECT TIME ───────────────────────────── */}
        {/* [CHANGED] Loop through each selected route for time selection */}
        {selectedRoutes.map((route) =>
          routeDetails[route.id]?.day ? (
            <View key={`time-${route.id}`}>
              <Text style={styles.stepTitle}>4. Pick-up Time for {route.name}</Text>
              <TouchableOpacity
                style={styles.selectorBtn}
                onPress={() => {
                  setActiveRouteId(route.id);
                  setShowTimeModal(true);
                }}
              >
                <Ionicons name="time-outline" size={20} color="#FCDE06" />
                <Text
                  style={[
                    styles.selectorText,
                    routeDetails[route.id]?.time && styles.selectorTextSelected,
                  ]}
                >
                  {routeDetails[route.id]?.time || 'Tap to choose time'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#666666" />
              </TouchableOpacity>
            </View>
          ) : null
        )}

        {/* ── STEP 5: NUMBER OF PASSENGERS ─────────────────── */}
        {/* [KEPT] Shown only when at least one route has time selected */}
        {selectedRoutes.some((route) => routeDetails[route.id]?.time) && (
          <>
            <Text style={styles.stepTitle}>5. Number of Passengers</Text>
            <View style={styles.counterRow}>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setPassengers(Math.max(1, passengers - 1))}
              >
                <Ionicons name="remove" size={24} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.counterDisplay}>
                <Text style={styles.counterNum}>{passengers}</Text>
                <Text style={styles.counterLabel}>
                  {passengers === 1 ? 'Passenger' : 'Passengers'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.counterBtn}
                onPress={() => setPassengers(Math.min(10, passengers + 1))}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 6: LOCAL OR INTERNATIONAL ───────────────── */}
        {/* [KEPT] Global currency selection applies to all routes */}
        {selectedRoutes.some((route) => routeDetails[route.id]?.time) && (
          <>
            <Text style={styles.stepTitle}>6. Pricing</Text>
            <View style={styles.currencyRow}>
              {/* UGX - Locals */}
              <TouchableOpacity
                style={[styles.currencyCard, currency === 'ugx' && styles.currencyCardSelected]}
                onPress={() => setCurrency('ugx')}
              >
                <Text style={styles.currencyFlag}>🇺🇬</Text>
                <Text style={styles.currencyLabel}>Local</Text>
                {/* [CHANGED] Show combined price for all selected routes */}
                <Text style={styles.currencyAmount}>
                  UGX{' '}
                  {selectedRoutes
                    .reduce((sum, route) => sum + (route.price_ugx || 0), 0)
                    .toLocaleString()}
                </Text>
                <Text style={styles.currencyPer}>total for all tours</Text>
                {currency === 'ugx' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#FCDE06"
                    style={styles.currencyCheck}
                  />
                )}
              </TouchableOpacity>

              {/* USD - International */}
              <TouchableOpacity
                style={[styles.currencyCard, currency === 'usd' && styles.currencyCardSelected]}
                onPress={() => setCurrency('usd')}
              >
                <Text style={styles.currencyFlag}>🌍</Text>
                <Text style={styles.currencyLabel}>International</Text>
                {/* [CHANGED] Show combined price for all selected routes */}
                <Text style={styles.currencyAmount}>
                  ${selectedRoutes.reduce((sum, route) => sum + (route.price_usd || 0), 0)} USD
                </Text>
                <Text style={styles.currencyPer}>total for all tours</Text>
                {currency === 'usd' && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#FCDE06"
                    style={styles.currencyCheck}
                  />
                )}
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* ── STEP 7: PAYMENT METHOD ────────────────────────── */}
        {/* [KEPT] Global payment method applies to all routes */}
        {currency && (
          <>
            <Text style={styles.stepTitle}>7. Payment Method</Text>
            {[
              { id: 'mtn_momo', icon: '📱', label: 'MTN Mobile Money', tag: 'UGX only' },
              { id: 'airtel_money', icon: '📲', label: 'Airtel Money', tag: 'UGX only' },
              { id: 'card', icon: '💳', label: 'Credit / Debit Card', tag: 'UGX & USD' },
            ].map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.payCard,
                  selectedPayment === method.id && styles.cardSelected,
                  currency === 'usd' && method.id !== 'card' && styles.payCardDisabled,
                ]}
                onPress={() => {
                  if (currency === 'usd' && method.id !== 'card') {
                    Alert.alert(
                      'Not Available',
                      'Mobile Money only supports UGX payments. Please use Card for USD.'
                    );
                    return;
                  }
                  setSelectedPayment(method.id);
                }}
              >
                <Text style={styles.payIcon}>{method.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payLabel}>{method.label}</Text>
                  <Text style={styles.payTag}>{method.tag}</Text>
                </View>
                {selectedPayment === method.id && (
                  <Ionicons name="checkmark-circle" size={20} color="#FCDE06" />
                )}
              </TouchableOpacity>
            ))}
          </>
        )}

        {/* ── BOOKING SUMMARY ───────────────────────────────── */}
        {/* [CHANGED] Show summary for all routes instead of single route */}
        {areAllRoutesComplete() && currency && selectedPayment && (
          <>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>📋 Booking Summary</Text>

              {/* [NEW] Show each route separately */}
              {selectedRoutes.map((route, index) => (
                <View key={route.id} style={styles.routeSummaryGroup}>
                  {selectedRoutes.length > 1 && (
                    <Text style={styles.routeSummaryTitle}>
                      Tour {index + 1}: {route.name}
                    </Text>
                  )}
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Pick-up Stop</Text>
                    <Text style={styles.summaryValue}>{routeDetails[route.id]?.stop}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date</Text>
                    <Text style={styles.summaryValue}>
                      {routeDetails[route.id]?.day?.dayName}{' '}
                      {routeDetails[route.id]?.day?.dayNumber}{' '}
                      {routeDetails[route.id]?.day?.monthName}
                    </Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Time</Text>
                    <Text style={styles.summaryValue}>{routeDetails[route.id]?.time}</Text>
                  </View>
                </View>
              ))}

              {/* Global details */}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Passengers</Text>
                <Text style={styles.summaryValue}>
                  {passengers} person{passengers > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pricing</Text>
                <Text style={styles.summaryValue}>
                  {currency === 'ugx' ? '🇺🇬 Local (UGX)' : '🌍 International (USD)'}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Payment</Text>
                <Text style={styles.summaryValue}>
                  {selectedPayment === 'mtn_momo'
                    ? 'MTN Mobile Money'
                    : selectedPayment === 'airtel_money'
                      ? 'Airtel Money'
                      : 'Card'}
                </Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.summaryLabel}>Total</Text>
                <Text style={styles.summaryValue}>
                  {selectedRoutes.length} tour{selectedRoutes.length > 1 ? 's' : ''}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Amount</Text>
                <Text style={[styles.summaryValue, styles.summaryTotal]}>
                  {getCurrencySymbol()} {getAmount().toLocaleString()}
                </Text>
              </View>
            </View>

            {/* PROCEED BUTTON */}
            <TouchableOpacity style={styles.proceedBtn} onPress={handleProceed}>
              <Ionicons name="arrow-forward" size={20} color="#000000" />
              <Text style={styles.proceedText}>
                Proceed to Payment ({selectedRoutes.length} tour
                {selectedRoutes.length > 1 ? 's' : ''})
              </Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ── STOP PICKER MODAL ─────────────────────────────────────── */}
      <Modal
        visible={showStopModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowStopModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {/* [CHANGED] Show which route we're selecting stop for */}
                Pick-up Stop{' '}
                {activeRouteId
                  ? `- ${selectedRoutes.find((r) => r.id === activeRouteId)?.name}`
                  : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowStopModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* [CHANGED] Get stops for the active route instead of single selectedRoute */}
              {activeRouteId &&
                getStops(selectedRoutes.find((r) => r.id === activeRouteId)).map(
                  (stop, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.modalItem,
                        routeDetails[activeRouteId]?.stop === stop && styles.modalItemSelected,
                      ]}
                      onPress={() => {
                        // [CHANGED] Update the specific route's stop
                        updateRouteDetail(activeRouteId, 'stop', stop);
                        setShowStopModal(false);
                      }}
                    >
                      <View style={styles.stopNumber}>
                        <Text style={styles.stopNumberText}>
                          {index === 0 ? '🟢' : index + 1}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.modalItemText,
                          routeDetails[activeRouteId]?.stop === stop &&
                            styles.modalItemTextSelected,
                        ]}
                      >
                        {stop}
                      </Text>
                      {routeDetails[activeRouteId]?.stop === stop && (
                        <Ionicons name="checkmark" size={18} color="#FCDE06" />
                      )}
                    </TouchableOpacity>
                  )
                )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── CALENDAR MODAL ────────────────────────────────────────── */}
      <Modal
        visible={showCalendarModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {/* [CHANGED] Show which route we're selecting date for */}
                Choose Date{' '}
                {activeRouteId
                  ? `- ${selectedRoutes.find((r) => r.id === activeRouteId)?.name}`
                  : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowCalendarModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ALL_DAYS.reduce((acc: any[], day, index) => {
                const month = day.monthName;
                const prevMonth = index > 0 ? ALL_DAYS[index - 1].monthName : null;
                if (month !== prevMonth) {
                  acc.push(
                    <Text key={`month-${month}`} style={styles.calMonthHeader}>
                      {month} {day.date.getFullYear()}
                    </Text>
                  );
                }
                acc.push(
                  <TouchableOpacity
                    key={day.fullDate}
                    style={[
                      styles.calDayRow,
                      activeRouteId !== null &&
                        routeDetails[activeRouteId]?.day?.fullDate === day.fullDate &&
                        styles.modalItemSelected,
                    ]}
                    onPress={() => {
                      // [CHANGED] Update the specific route's day
                      activeRouteId && updateRouteDetail(activeRouteId, 'day', day);
                      setShowCalendarModal(false);
                    }}
                  >
                    <View style={styles.calDayLeft}>
                      <Text style={styles.calDayName}>{day.dayName}</Text>
                      <Text
                        style={[
                          styles.calDayNum,
                          activeRouteId !== null &&
                            routeDetails[activeRouteId]?.day?.fullDate === day.fullDate &&
                            styles.calDayNumSelected,
                        ]}
                      >
                        {day.dayNumber}
                      </Text>
                    </View>
                    {day.label ? (
                      <View style={styles.calBadge}>
                        <Text style={styles.calBadgeText}>{day.label}</Text>
                      </View>
                    ) : null}
                    {activeRouteId &&
                      routeDetails[activeRouteId]?.day?.fullDate === day.fullDate && (
                        <Ionicons name="checkmark-circle" size={20} color="#FCDE06" />
                      )}
                  </TouchableOpacity>
                );
                return acc;
              }, [])}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── TIME PICKER MODAL ─────────────────────────────────────── */}
      <Modal
        visible={showTimeModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowTimeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {/* [CHANGED] Show which route we're selecting time for */}
                Choose Pick-up Time{' '}
                {activeRouteId
                  ? `- ${selectedRoutes.find((r) => r.id === activeRouteId)?.name}`
                  : ''}
              </Text>
              <TouchableOpacity onPress={() => setShowTimeModal(false)}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              {ALL_HOURS.map((time) => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeRow,
                    activeRouteId !== null &&
                      routeDetails[activeRouteId]?.time === time &&
                      styles.modalItemSelected,
                  ]}
                  onPress={() => {
                    // [CHANGED] Update the specific route's time
                    activeRouteId && updateRouteDetail(activeRouteId, 'time', time);
                    setShowTimeModal(false);
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={
                      activeRouteId && routeDetails[activeRouteId]?.time === time
                        ? '#FCDE06'
                        : '#666666'
                    }
                  />
                  <Text
                    style={[
                      styles.timeText,
                      activeRouteId !== null &&
                        routeDetails[activeRouteId]?.time === time &&
                        styles.timeTextSelected,
                    ]}
                  >
                    {time}
                  </Text>
                  <Text style={styles.timeAMPM}>
                    {parseInt(time.split(':')[0]) < 12
                      ? 'AM'
                      : parseInt(time.split(':')[0]) === 12
                        ? 'Noon'
                        : 'PM'}
                  </Text>
                  {activeRouteId && routeDetails[activeRouteId]?.time === time && (
                    <Ionicons name="checkmark" size={18} color="#FCDE06" />
                  )}
                </TouchableOpacity>
              ))}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#FCDE06',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  stepTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FCDE06',
    marginTop: 24,
    marginBottom: 12,
  },

  // [NEW] Style for the selected routes count banner
  selectedCountBanner: {
    backgroundColor: '#1a1a00',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FCDE06',
  },
  selectedCountText: {
    color: '#FCDE06',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },

  routeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardSelected: { borderColor: '#FCDE06', backgroundColor: '#111100' },
  routeLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  routeEmoji: { fontSize: 32 },
  routeName: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 4 },
  routeMeta: { fontSize: 12, color: '#AAAAAA', marginBottom: 8 },
  pricePills: { flexDirection: 'row', gap: 8 },
  pricePill: {
    backgroundColor: '#000000',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  pricePillUSD: { borderColor: '#FCDE06' },
  pricePillText: { fontSize: 11, color: '#FFFFFF', fontWeight: '600' },
  checkIcon: { marginLeft: 8 },

  selectorBtn: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#333333',
  },
  selectorText: { flex: 1, fontSize: 15, color: '#666666' },
  selectorTextSelected: { color: '#FFFFFF', fontWeight: '500' },

  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 16,
  },
  counterBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
  },
  counterDisplay: { alignItems: 'center', gap: 4 },
  counterNum: { fontSize: 40, fontWeight: 'bold', color: '#FCDE06' },
  counterLabel: { fontSize: 13, color: '#AAAAAA' },

  currencyRow: { flexDirection: 'row', gap: 12 },
  currencyCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#333333',
  },
  currencyCardSelected: { borderColor: '#FCDE06', backgroundColor: '#111100' },
  currencyFlag: { fontSize: 32 },
  currencyLabel: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' },
  currencyAmount: { fontSize: 16, fontWeight: 'bold', color: '#FCDE06' },
  currencyPer: { fontSize: 11, color: '#666666' },
  currencyCheck: { position: 'absolute', top: 8, right: 8 },

  payCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 2,
    borderColor: '#333333',
    marginBottom: 10,
  },
  payCardDisabled: { opacity: 0.4 },
  payIcon: { fontSize: 24 },
  payLabel: { fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  payTag: { fontSize: 11, color: '#666666', marginTop: 2 },

  summaryCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginTop: 24,
    borderWidth: 2,
    borderColor: '#FCDE06',
    gap: 12,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FCDE06',
    marginBottom: 4,
  },
  // [NEW] Style for grouping each route in the summary
  routeSummaryGroup: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  routeSummaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FCDE06',
    marginBottom: 8,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#FCDE06',
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  summaryLabel: { fontSize: 14, color: '#AAAAAA' },
  summaryValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  summaryTotal: { fontSize: 20, fontWeight: 'bold', color: '#FCDE06' },

  proceedBtn: {
    backgroundColor: '#FCDE06',
    borderRadius: 14,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
  },
  proceedText: { fontSize: 18, fontWeight: 'bold', color: '#000000' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#111111',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalItemSelected: { backgroundColor: '#1a1a00' },
  modalItemText: { flex: 1, fontSize: 14, color: '#CCCCCC' },
  modalItemTextSelected: { color: '#FCDE06', fontWeight: '600' },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopNumberText: { fontSize: 12, fontWeight: 'bold', color: '#FCDE06' },

  calMonthHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FCDE06',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: '#111111',
  },
  calDayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  calDayLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  calDayName: { fontSize: 13, color: '#666666', width: 36 },
  calDayNum: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  calDayNumSelected: { color: '#FCDE06' },
  calBadge: {
    backgroundColor: '#FCDE06',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  calBadgeText: { fontSize: 11, fontWeight: 'bold', color: '#000000' },

  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  timeText: { flex: 1, fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
  timeTextSelected: { color: '#FCDE06' },
  timeAMPM: { fontSize: 13, color: '#666666', width: 36, textAlign: 'right' },
});