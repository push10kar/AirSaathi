import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ActivityIndicator, TextInput, KeyboardAvoidingView, Platform, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { reportContent } from '../../services/mockCommunityDB';

const REPORT_REASONS = [
  'Spam',
  'Abuse',
  'Misinformation',
  'Other'
];

export default function ReportModal({ visible, onClose, target, targetType }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);

  const [selectedReason, setSelectedReason] = useState(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const scaleAnim = React.useRef(new Animated.Value(0.85)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  const handleSubmit = async () => {
    if (!selectedReason || !target) return;
    setSubmitting(true);
    try {
      await reportContent(targetType, target.id, selectedReason, details);
      setShowSuccess(true);
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        })
      ]).start();
      
      setTimeout(() => {
        setSelectedReason(null);
        setDetails('');
        setShowSuccess(false);
        scaleAnim.setValue(0.85);
        opacityAnim.setValue(0);
        onClose();
      }, 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.container}>
          {showSuccess ? (
            <Animated.View style={[styles.successContainer, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
              <View style={styles.successIconCircle}>
                <Feather name="check" size={40} color={isDarkMode ? '#000' : '#fff'} />
              </View>
              <Text style={styles.successTitle}>Report Submitted</Text>
              <Text style={styles.successDesc}>Thank you for helping keep our community safe. Our team will review this shortly.</Text>
            </Animated.View>
          ) : (
            <>
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Report {targetType}</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <Feather name="x" size={24} color={theme.colors.text.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.description}>
                Why are you reporting this {targetType}? Your report will be reviewed by our team.
              </Text>

              {REPORT_REASONS.map(reason => (
                <TouchableOpacity 
                  key={reason} 
                  style={styles.reasonRow}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text style={styles.reasonText}>{reason}</Text>
                  <View style={styles.radioOut}>
                    {selectedReason === reason && <View style={styles.radioIn} />}
                  </View>
                </TouchableOpacity>
              ))}

              <TextInput
                style={styles.detailsInput}
                placeholder="Additional details (optional)..."
                placeholderTextColor={theme.colors.text.secondary}
                value={details}
                onChangeText={setDetails}
                multiline
              />

              <TouchableOpacity 
                style={[styles.submitBtn, (!selectedReason || submitting) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={!selectedReason || submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.submitBtnText}>Submit Report</Text>
                )}
              </TouchableOpacity>
            </>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 20,
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: 24,
    width: '100%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: theme.fonts.headline.semiBold,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginBottom: 24,
  },
  reasonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.elevated,
  },
  reasonText: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  radioOut: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioIn: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent.primary,
  },
  detailsInput: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.primary,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.background.elevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    backgroundColor: theme.colors.support.error,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 32,
  },
  submitBtnDisabled: {
    backgroundColor: theme.colors.background.secondary,
  },
  submitBtnText: {
    fontFamily: theme.fonts.label.bold,
    fontSize: 16,
    color: '#fff',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 22,
    color: theme.colors.text.primary,
    marginBottom: 8,
  },
  successDesc: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 20,
  }
});
