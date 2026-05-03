import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { MaterialIcons, Feather, Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

export default function LearnDetailModal({ visible, topic, onClose, onTakeAction }) {
  const { theme, isDarkMode } = useAppTheme();
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setQuizAnswered(false);
      setQuizCorrect(null);
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!topic) return null;

  const handleQuizPress = (isCorrect) => {
    setQuizAnswered(true);
    setQuizCorrect(isCorrect);
    if (!isCorrect) {
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  };

  const styles = getStyles(theme, isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.backdrop} 
          onPress={onClose} 
        />
        
        <View style={styles.modalContainer}>
          <View style={styles.indicator} />
          
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: theme.colors.accent.primary + '15' }]}>
              <MaterialIcons name={topic.icon} size={28} color={theme.colors.accent.primary} />
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.muted} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={styles.category}>{topic.category}</Text>
            <Text style={styles.title}>{topic.title}</Text>
            
            <Animated.View style={{ opacity: fadeAnim }}>
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>The Basics</Text>
                <Text style={styles.bodyText}>{topic.short}</Text>
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Why it Matters</Text>
                <Text style={styles.bodyText}>{topic.why}</Text>
              </View>

              <View style={styles.takeawayCard}>
                <View style={styles.takeawayHeader}>
                  <Ionicons name="bulb-outline" size={20} color={isDarkMode ? '#000' : '#fff'} />
                  <Text style={styles.takeawayLabel}>KEY TAKEAWAY</Text>
                </View>
                <Text style={styles.takeawayText}>{topic.takeaway}</Text>
              </View>

              {topic.actions && topic.actions.length > 0 && (
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => {
                    onTakeAction(topic.actions);
                    onClose();
                  }}
                >
                  <Text style={styles.actionBtnText}>Take Action Now</Text>
                  <Feather name="arrow-right" size={20} color={isDarkMode ? '#000' : '#fff'} />
                </TouchableOpacity>
              )}

              {/* Step 5: Quick Quiz Integration */}
              <View style={styles.quizBox}>
                <Text style={styles.quizQuestion}>QUICK CHECK: Is {topic.title.split(' ').slice(-1)} harmful?</Text>
                
                {!quizAnswered ? (
                  <View style={styles.quizActions}>
                    <TouchableOpacity 
                      style={[styles.quizBtn, { marginRight: 10 }]} 
                      onPress={() => handleQuizPress(true)}
                    >
                      <Text style={styles.quizBtnText}>Yes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.quizBtn} 
                      onPress={() => handleQuizPress(false)}
                    >
                      <Text style={styles.quizBtnText}>No</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <Animated.View style={[
                    styles.quizFeedback, 
                    { transform: [{ translateX: shakeAnim }] }
                  ]}>
                    <Ionicons 
                      name={quizCorrect ? "checkmark-circle" : "alert-circle"} 
                      size={24} 
                      color={quizCorrect ? theme.colors.accent.primary : "#FF4B4B"} 
                    />
                    <Text style={[
                      styles.quizFeedbackText, 
                      { color: quizCorrect ? theme.colors.accent.primary : "#FF4B4B" }
                    ]}>
                      {quizCorrect ? "Correct! You're an expert." : "Actually, it is! Read above again."}
                    </Text>
                  </Animated.View>
                )}
              </View>
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContainer: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    height: '85%',
    paddingHorizontal: 28,
    paddingTop: 12,
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtn: {
    padding: 8,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 14,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  category: {
    fontFamily: 'Inter_700Bold',
    fontSize: 12,
    color: theme.colors.accent.primary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 32,
    color: theme.colors.text.primary,
    marginBottom: 32,
    lineHeight: 38,
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  bodyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 17,
    color: theme.colors.text.secondary,
    lineHeight: 26,
  },
  takeawayCard: {
    backgroundColor: theme.colors.accent.primary,
    padding: 24,
    borderRadius: 24,
    marginTop: 10,
    marginBottom: 32,
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  takeawayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    opacity: 0.9,
  },
  takeawayLabel: {
    fontFamily: 'Inter_800ExtraBold',
    fontSize: 12,
    color: isDarkMode ? '#000' : '#fff',
    marginLeft: 8,
    letterSpacing: 1,
  },
  takeawayText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 18,
    color: isDarkMode ? '#000' : '#fff',
    lineHeight: 24,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDarkMode ? theme.colors.background.secondary : '#000',
    paddingVertical: 20,
    borderRadius: 24,
    marginBottom: 40,
  },
  actionBtnText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    color: isDarkMode ? theme.colors.text.primary : '#fff',
    marginRight: 12,
  },
  quizBox: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
  },
  quizQuestion: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    color: theme.colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quizActions: {
    flexDirection: 'row',
    width: '100%',
  },
  quizBtn: {
    flex: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  quizBtnText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    color: theme.colors.text.primary,
  },
  quizFeedback: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  quizFeedbackText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
    marginLeft: 10,
  }
});
