import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
    Linking,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface RateModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function RateModal({ visible, onClose }: RateModalProps) {
  const [selectedStars, setSelectedStars] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const labels = ['', 'Terrible 😟', 'Poor 😕', 'Okay 😐', 'Good 😊', 'Excellent 🤩'];

  const handleSubmit = async () => {
    if (selectedStars === 0) return;
    setSubmitted(true);
    setTimeout(async () => {
      onClose();
      setSubmitted(false);
      setSelectedStars(0);
      await Linking.openURL('market://details?id=com.ksb.app').catch(() =>
        Linking.openURL('https://play.google.com/store/apps/details?id=com.ksb.app')
      );
    }, 1500);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={22} color="#AAAAAA" />
          </TouchableOpacity>

          {submitted ? (
            <View style={styles.thankYouContainer}>
              <Text style={styles.thankYouEmoji}>🎉</Text>
              <Text style={styles.thankYouTitle}>Thank You!</Text>
              <Text style={styles.thankYouSubtitle}>Taking you to the app store...</Text>
            </View>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Text style={styles.busEmoji}>🚌</Text>
              </View>

              <Text style={styles.title}>Enjoying KSB?</Text>
              <Text style={styles.subtitle}>Rate your experience on the app store</Text>

              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setSelectedStars(star)}
                    style={styles.starButton}
                  >
                    <Ionicons
                      name={star <= selectedStars ? 'star' : 'star-outline'}
                      size={40}
                      color={star <= selectedStars ? '#FCDE06' : '#444444'}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.ratingLabel}>
                {selectedStars > 0 ? labels[selectedStars] : 'Tap a star to rate'}
              </Text>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  selectedStars === 0 && styles.submitButtonDisabled,
                ]}
                onPress={handleSubmit}
                disabled={selectedStars === 0}
              >
                <Text style={styles.submitButtonText}>Submit Rating</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.notNow} onPress={onClose}>
                <Text style={styles.notNowText}>Not Now</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    padding: 28,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
    gap: 12,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FCDE06',
    marginBottom: 4,
  },
  busEmoji: { fontSize: 40 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  starButton: { padding: 4 },
  ratingLabel: {
    fontSize: 15,
    color: '#FCDE06',
    fontWeight: '600',
    height: 22,
  },
  submitButton: {
    backgroundColor: '#FCDE06',
    borderRadius: 12,
    paddingVertical: 14,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: { backgroundColor: '#333333' },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  notNow: { paddingVertical: 4 },
  notNowText: { fontSize: 14, color: '#666666' },
  thankYouContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 12,
  },
  thankYouEmoji: { fontSize: 56 },
  thankYouTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  thankYouSubtitle: { fontSize: 14, color: '#AAAAAA' },
});