import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../context/ThemeContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TAB_WIDTH = SCREEN_WIDTH / 4;
const TOTAL_TABS = 6;
const NAVBAR_MAX_SCROLL = (TOTAL_TABS * TAB_WIDTH) - SCREEN_WIDTH;

export const TABS = [
  { id: 'Home', title: 'HOME', icon: 'home' },
  { id: 'Learn', title: 'LEARN', icon: 'book-open' },
  { id: 'Community', title: 'COMMUNITY', icon: 'users' },
  { id: 'Action', title: 'ACTION', icon: 'zap' },
  { id: 'Alerts', title: 'ALERTS', icon: 'bell' },
  { id: 'Profile', title: 'PROFILE', icon: 'user' },
];

export default function BottomNavBar({ scrollX, onTabPress, activeIndex }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);

  // Interpolate the main screen scroll position to the navbar's translate X
  const translateX = scrollX.interpolate({
    inputRange: [0, SCREEN_WIDTH * (TOTAL_TABS - 1)],
    outputRange: [0, -NAVBAR_MAX_SCROLL],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.navTrack, { transform: [{ translateX }] }]}>
        {TABS.map((tab, index) => {
          const isActive = activeIndex === index;
          
            const colorInterpolation = scrollX.interpolate({
              inputRange: [
                (index - 1) * SCREEN_WIDTH,
                index * SCREEN_WIDTH,
                (index + 1) * SCREEN_WIDTH
              ],
              outputRange: [
                theme.colors.text.secondary,
                theme.colors.accent.primary,
                theme.colors.text.secondary
              ],
              extrapolate: 'clamp',
            });

          const activeOpacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH
            ],
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });

          const inactiveOpacity = scrollX.interpolate({
            inputRange: [
              (index - 1) * SCREEN_WIDTH,
              index * SCREEN_WIDTH,
              (index + 1) * SCREEN_WIDTH
            ],
            outputRange: [1, 0, 1],
            extrapolate: 'clamp',
          });

          return (
            <TouchableOpacity 
              key={tab.id} 
              style={styles.navItem} 
              onPress={() => onTabPress(index)}
              activeOpacity={0.7}
            >
              <View style={styles.iconWrapper}>
                {/* Inactive State */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: inactiveOpacity, alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name={tab.icon} size={24} color={theme.colors.text.secondary} />
                </Animated.View>
                
                {/* Active State */}
                <Animated.View style={[StyleSheet.absoluteFill, { opacity: activeOpacity, alignItems: 'center', justifyContent: 'center' }]}>
                  <Feather name={tab.icon} size={24} color={theme.colors.accent.primary} />
                </Animated.View>
              </View>
              <Animated.Text style={[styles.navText, { color: colorInterpolation }]}>
                {tab.title}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: isDarkMode ? 'rgba(9, 9, 9, 0.95)' : 'rgba(248, 249, 255, 0.95)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(187, 203, 185, 0.2)',
    borderLeftWidth: 1,
    borderLeftColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(187, 203, 185, 0.1)',
    borderRightWidth: 1,
    borderRightColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(187, 203, 185, 0.1)',
    paddingVertical: 16,
    zIndex: 100,
    shadowColor: theme.colors.accent.primary,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
    overflow: 'hidden', // Ensures items sliding out are clipped
  },
  navTrack: {
    flexDirection: 'row',
    width: TAB_WIDTH * TOTAL_TABS,
  },
  navItem: {
    width: TAB_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
    width: 24,
  },
  navText: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 4,
  }
});
