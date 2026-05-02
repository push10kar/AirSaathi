import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { API_URL } from '../config';

const REPORT_TYPES = [
  { id: 'bug', label: 'Report a Bug', icon: 'bug-report' },
  { id: 'feedback', label: 'App Feedback', icon: 'feedback' },
  { id: 'aqi_issue', label: 'AQI Data Issue', icon: 'warning' },
  { id: 'other', label: 'Other', icon: 'more-horiz' },
];

export default function ReportModal({ visible, onClose, token }) {
  const { theme, isDarkMode } = useAppTheme();
  const [type, setType] = useState('feedback');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ type, message })
      });

      if (response.ok) {
        setShowSuccess(true);
        setMessage('');
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to submit report');
      }
    } catch (error) {
      alert('Submission Failed: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setShowSuccess(false);
    onClose();
  };

  const styles = getStyles(theme, isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.backdrop} 
          onPress={handleClose} 
        />
        
        <View style={styles.modalContainer}>
          {!showSuccess ? (
            <>
              <View style={styles.header}>
                <Text style={styles.title}>Report / Feedback</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                  <MaterialIcons name="close" size={24} color={theme.colors.text.muted} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Select Category</Text>
              <View style={styles.typeGrid}>
                {REPORT_TYPES.map((t) => (
                  <TouchableOpacity
                    key={t.id}
                    style={[
                      styles.typeItem,
                      type === t.id && styles.typeItemActive
                    ]}
                    onPress={() => setType(t.id)}
                  >
                    <View style={[
                      styles.iconContainer,
                      type === t.id && styles.iconContainerActive
                    ]}>
                      <MaterialIcons 
                        name={t.icon} 
                        size={22} 
                        color={type === t.id ? (isDarkMode ? '#000' : '#fff') : theme.colors.text.muted} 
                      />
                    </View>
                    <Text style={[
                      styles.typeLabel, 
                      type === t.id && styles.typeLabelActive
                    ]}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={styles.input}
                placeholder="Tell us what's happening..."
                placeholderTextColor={theme.colors.text.muted}
                multiline
                numberOfLines={5}
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!message.trim() || isSubmitting) && { opacity: 0.5 }
                ]}
                onPress={handleSubmit}
                disabled={!message.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.successContainer}>
              <View style={styles.successBadge}>
                <Feather name="check-circle" size={80} color={theme.colors.accent.primary} />
              </View>
              <Text style={styles.successTitle}>Report Submitted!</Text>
              <Text style={styles.successMessage}>
                Your feedback helps us make AirSaathi better for everyone. Our team will look into it shortly.
              </Text>
              <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    width: '100%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: 32,
    padding: 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 24,
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    padding: 8,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 12,
  },
  label: {
    fontFamily: 'Inter_700Bold',
    fontSize: 13,
    color: theme.colors.text.secondary,
    marginBottom: 14,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  typeItem: {
    width: '48%',
    backgroundColor: theme.colors.background.secondary,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeItemActive: {
    borderColor: theme.colors.accent.primary,
    backgroundColor: isDarkMode ? 'rgba(196, 255, 1, 0.05)' : 'rgba(0, 109, 50, 0.03)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerActive: {
    backgroundColor: theme.colors.accent.primary,
  },
  typeLabel: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
    color: theme.colors.text.muted,
    flex: 1,
  },
  typeLabelActive: {
    color: theme.colors.text.primary,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
    minHeight: 140,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    marginBottom: 32,
  },
  submitBtn: {
    backgroundColor: theme.colors.accent.primary,
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: isDarkMode ? '#000' : '#fff',
  },
  
  // Success View Styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successBadge: {
    marginBottom: 24,
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },
  successTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 26,
    color: theme.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontFamily: 'Inter_400Regular',
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  doneBtn: {
    backgroundColor: isDarkMode ? theme.colors.background.secondary : '#000',
    paddingVertical: 18,
    paddingHorizontal: 48,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: isDarkMode ? theme.colors.text.primary : '#fff',
  }
});
