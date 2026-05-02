import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import LocationSearchModal from './LocationSearchModal';

export default function TopAppBar({ greeting = "GOOD MORNING!", onMenuPress, streakCount = 7 }) {
  const { theme, isDarkMode } = useAppTheme();
  const { location } = useLocation();
  const [searchVisible, setSearchVisible] = useState(false);
  const styles = getStyles(theme, isDarkMode);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <MaterialIcons name="menu" size={28} color={theme.colors.accent.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.greetingText}>{greeting.toUpperCase()}</Text>
          <TouchableOpacity style={styles.locationContainer} onPress={() => setSearchVisible(true)}>
            <MaterialIcons name="location-on" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.locationText}>{location.city}, MH</Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <LocationSearchModal 
        visible={searchVisible} 
        onClose={() => setSearchVisible(false)} 
      />
      <View style={styles.headerRight}>
        {/* Streak Counter */}
        <View style={styles.streakContainer}>
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakCount}>{streakCount}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <MaterialIcons name="notifications" size={28} color={theme.colors.accent.primary} />
          <View style={styles.badge}>
            <Text style={styles.badgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.colors.background.primary,
    zIndex: 50,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconButton: {
    padding: 4,
    marginRight: 10,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: isDarkMode ? theme.colors.accent.primary + '50' : theme.colors.accent.primary + '35',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakCount: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 14,
    color: theme.colors.accent.primary,
    marginLeft: 4,
  },
  greetingText: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 14,
    color: theme.colors.accent.primary,
    letterSpacing: 0.5,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  locationText: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginHorizontal: 2,
  },
  notificationButton: {
    padding: 4,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: theme.colors.support.error || '#E53935',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  badgeText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: theme.fonts.body.bold,
    lineHeight: 12,
  }
});
