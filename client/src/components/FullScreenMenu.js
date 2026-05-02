import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Switch,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

const { height } = Dimensions.get('window');

const MENU_SECTIONS = [
  {
    items: [
      { id: 'profile', label: 'Profile / Account', icon: 'person-outline', subtitle: 'View profile, edit details' },
    ],
  },
  {
    items: [
      { id: 'location', label: 'Location Control', icon: 'my-location', subtitle: 'Change city, use current location' },
      { id: 'notifications', label: 'Notifications', icon: 'notifications-none', subtitle: 'AQI alerts, health alerts' },
    ],
  },
  {
    items: [
      { id: 'theme', label: 'Appearance', icon: 'contrast', isThemeToggle: true },
      { id: 'language', label: 'Language', icon: 'translate', subtitle: 'English, Hindi, Marathi' },
      { id: 'preferences', label: 'Personalization', icon: 'tune', subtitle: 'Sensitivity, indoor/outdoor' },
    ],
  },
  {
    items: [
      { id: 'progress', label: 'My Progress', icon: 'emoji-events', subtitle: 'Actions, streaks' },
      { id: 'report', label: 'Report / Feedback', icon: 'flag', subtitle: 'Report issue, app feedback' },
    ],
  },
  {
    items: [
      { id: 'about', label: 'About AirSaathi', icon: 'info-outline', subtitle: 'What is AQI?, app info' },
      { id: 'logout', label: 'Logout', icon: 'logout', isDestructive: true },
    ],
  },
];

export default function FullScreenMenu({ visible, onClose }) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);
  
  const slideAnim = useRef(new Animated.Value(-height)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          stiffness: 180,
          damping: 24,
          mass: 1,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: -height,
          useNativeDriver: true,
          stiffness: 180,
          damping: 24,
          mass: 1,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible && slideAnim._value === -height) return null;

  const renderItem = (item) => {
    if (item.isThemeToggle) {
      return (
        <View key={item.id} style={styles.menuItem}>
          <View style={styles.itemIconContainer}>
            <MaterialIcons
              name={isDarkMode ? 'dark-mode' : 'light-mode'}
              size={20}
              color={theme.colors.accent.primary}
            />
          </View>
          <Text style={styles.itemLabel}>
            {isDarkMode ? 'Dark Mode' : 'Light Mode'}
          </Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: theme.colors.text.secondary, true: theme.colors.accent.primary }}
            thumbColor={isDarkMode ? '#000' : '#fff'}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity key={item.id} style={styles.menuItem} activeOpacity={0.6}>
        <View style={[styles.itemIconContainer, item.isDestructive && styles.itemIconDestructive]}>
          <MaterialIcons
            name={item.icon}
            size={20}
            color={item.isDestructive ? theme.colors.support.error : theme.colors.accent.primary}
          />
        </View>
        <View style={styles.itemTextContainer}>
          <Text style={[styles.itemLabel, item.isDestructive && styles.itemLabelDestructive]}>
            {item.label}
          </Text>
          {item.subtitle && (
            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={20} color={theme.colors.text.muted} />
      </TouchableOpacity>
    );
  };

  return (
    <Animated.View style={[
      styles.overlay,
      {
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }]
      }
    ]}>
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="eco" size={28} color={theme.colors.accent.primary} />
            <Text style={styles.logoText}>AirSaathi</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Menu */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {MENU_SECTIONS.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.sectionCard}>
              {section.items.map((item, itemIndex) => (
                <React.Fragment key={item.id}>
                  {itemIndex > 0 && <View style={styles.itemDivider} />}
                  {renderItem(item)}
                </React.Fragment>
              ))}
            </View>
          ))}
        </ScrollView>

      </View>
    </Animated.View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.colors.background.primary,
    zIndex: 1000,
    ...Platform.select({
      web: {
        height: '100vh',
      }
    })
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 40 : 60,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 22,
    color: theme.colors.text.primary,
    marginLeft: 8,
  },
  closeButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
  },
  closeButtonText: {
    fontFamily: theme.fonts.body.bold,
    fontSize: 11,
    color: theme.colors.text.secondary,
    letterSpacing: 1.5,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  sectionCard: {
    backgroundColor: theme.colors.background.elevated,
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: isDarkMode
      ? theme.colors.accent.primary + '15'
      : theme.colors.accent.primary + '12',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  itemIconDestructive: {
    backgroundColor: (theme.colors.support.error || '#E53935') + '15',
  },
  itemTextContainer: {
    flex: 1,
  },
  itemLabel: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  itemLabelDestructive: {
    color: theme.colors.support.error || '#E53935',
  },
  itemSubtitle: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 12,
    color: theme.colors.text.muted,
    marginTop: 2,
  },
  itemDivider: {
    height: 1,
    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
    marginHorizontal: 16,
  },
});
