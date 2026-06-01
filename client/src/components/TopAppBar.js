import React, { useState, useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';
import { useLocation } from '../context/LocationContext';
import { useAuth } from '../context/AuthContext';
import LocationSearchModal from './LocationSearchModal';

const GREETINGS = {
  morning: ["Good Morning", "Rise & Shine", "Start Fresh", "Breathe Deep", "Morning"],
  afternoon: ["Good Afternoon", "Stay Refreshed", "Afternoon Vibes", "Keep Going", "Stay Active"],
  evening: ["Good Evening", "Wind Down", "Evening Calm", "Stay Protected", "Evening Updates"],
  night: ["Good Night", "Rest Well", "Night Mode On", "Stay Indoors", "Dream Green"]
};

const getDynamicGreeting = () => {
  const hour = new Date().getHours();
  let timeSlot = 'morning';
  if (hour >= 12 && hour < 17) timeSlot = 'afternoon';
  else if (hour >= 17 && hour < 21) timeSlot = 'evening';
  else if (hour >= 21 || hour < 5) timeSlot = 'night';
  
  const options = GREETINGS[timeSlot];
  const index = new Date().getDate() % options.length;
  return options[index];
};

const TopAppBar = React.memo(function TopAppBar({ 
  onMenuPress, 
  onProfilePress,
  onStreakPress,
  onLocationPress,
  user,
  streakCount = 7 
}) {
  const { theme, isDarkMode } = useAppTheme();
  const { location } = useLocation();
  const { requireAuth } = useAuth();
  
  const greetingBase = useMemo(() => getDynamicGreeting(), []);
  const firstName = user?.name ? user.name.split(' ')[0] : '';
  const fullGreeting = firstName ? `${greetingBase}, ${firstName}!` : `${greetingBase.toUpperCase()}!`;
  
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <TouchableOpacity style={styles.iconButton} onPress={onMenuPress}>
          <MaterialIcons name="menu" size={28} color={theme.colors.accent.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.greetingText}>{fullGreeting}</Text>
          <TouchableOpacity style={styles.locationContainer} onPress={onLocationPress}>
            <MaterialIcons name="location-on" size={14} color={theme.colors.text.secondary} />
            <Text style={styles.locationText}>{location.city || 'Select Location'}</Text>
            <MaterialIcons name="keyboard-arrow-down" size={14} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.headerRight}>
        {/* Streak Counter */}
        <TouchableOpacity 
          style={styles.streakContainer}
          onPress={onStreakPress}
          activeOpacity={0.7}
        >
          <Text style={styles.streakIcon}>🔥</Text>
          <Text style={styles.streakCount}>{streakCount}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.profileButton} 
          activeOpacity={0.7}
          onPress={() => {
            if (!user) {
              requireAuth(() => onProfilePress());
            } else {
              onProfilePress();
            }
          }}
        >
          {user && user.avatar_url ? (
            <Image 
              source={{ uri: user.avatar_url }} 
              style={styles.avatarImage} 
            />
          ) : (
            <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.background.secondary }]}>
              <Feather name="user" size={20} color={user ? theme.colors.text.muted : theme.colors.accent.primary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
});

export default TopAppBar;

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
  profileButton: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: theme.colors.accent.primary,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
  },
});
