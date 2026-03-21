import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import DrawerMenu from './DrawerMenu';
import topNavConfig from '../context/topNav.json';
import designSystem from '../context/design_system.json';
import { useSegments } from 'expo-router';

// ─── Floating Glass Button ─────────────────────────────────────────
// A reusable floating chip-style button with blur background and press feedback.
const FloatingButton = ({ children, onPress, isDark, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, friction: 8, tension: 100 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 60 }).start();
  };

  // iOS: real blur (20–25 range for top nav)
  // Android: minimal — rely on tint overlay fallback
  const isIOS = Platform.OS === 'ios';
  const blurIntensity = isIOS ? (isDark ? 25 : 20) : (isDark ? 15 : 10);

  return (
    <Pressable onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.floatingButton, style, { transform: [{ scale }] }]}>
        {/* Layer 1: Blur background */}
        <BlurView
          tint={isDark ? 'dark' : 'light'}
          intensity={blurIntensity}
          style={StyleSheet.absoluteFill}
        />
        {/* Layer 2: Tint overlay — heavier on Android to simulate glass without real blur */}
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: Platform.OS === 'ios'
                ? (isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.65)')
                : (isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.82)'),
              borderColor: isDark ? 'rgba(148, 163, 184, 0.15)' : 'rgba(0, 0, 0, 0.08)',
              borderWidth: 1,
              borderRadius: 14,
            },
          ]}
        />
        {/* Layer 3: Content */}
        <View style={styles.floatingButtonContent}>
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
};

// ─── Hamburger / Close Toggle ──────────────────────────────────────
const HamburgerToggle = ({ isOpen, color, onPress, isDark }: any) => {
  const anim = useRef(new Animated.Value(isOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: isOpen ? 1 : 0, useNativeDriver: true, friction: 8, tension: 50 }).start();
  }, [isOpen]);

  const rotHam = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const opHam = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const rotClose = anim.interpolate({ inputRange: [0, 1], outputRange: ['-180deg', '0deg'] });
  const opClose = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <FloatingButton onPress={onPress} isDark={isDark}>
      <Animated.View style={{ position: 'absolute', opacity: opHam, transform: [{ rotate: rotHam }] }}>
        <Ionicons name="menu" size={topNavConfig.topNavBar.icons.size} color={color} />
      </Animated.View>
      <Animated.View style={{ opacity: opClose, transform: [{ rotate: rotClose }] }}>
        <Ionicons name="close" size={topNavConfig.topNavBar.icons.size} color={color} />
      </Animated.View>
    </FloatingButton>
  );
};

// ─── Theme Toggle (Sun / Moon) ─────────────────────────────────────
const ThemeToggle = ({ isDark, color, onPress }: any) => {
  const anim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(anim, { toValue: isDark ? 1 : 0, useNativeDriver: true, friction: 8, tension: 50 }).start();
  }, [isDark]);

  const rotSun = anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '90deg'] });
  const opSun = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  const rotMoon = anim.interpolate({ inputRange: [0, 1], outputRange: ['-90deg', '0deg'] });
  const opMoon = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <FloatingButton onPress={onPress} isDark={isDark}>
      <Animated.View style={{ position: 'absolute', opacity: opSun, transform: [{ rotate: rotSun }] }}>
        <Ionicons name="sunny-outline" size={topNavConfig.topNavBar.icons.size} color={color} />
      </Animated.View>
      <Animated.View style={{ opacity: opMoon, transform: [{ rotate: rotMoon }] }}>
        <Ionicons name="moon-outline" size={topNavConfig.topNavBar.icons.size} color={color} />
      </Animated.View>
    </FloatingButton>
  );
};

// ─── TopNavBar ─────────────────────────────────────────────────────
export default function TopNavBar() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const themeColors = {
    text_primary: isDark ? designSystem.designSystem.colors.primary.mint : '#064E3B',
    icons: isDark ? designSystem.designSystem.colors.primary.mint : '#064E3B',
  };

  const insets = useSafeAreaInsets();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const segments = useSegments();
  const currentTab = segments[segments.length - 1] || 'index';

  const handleDrawerToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(!drawerOpen);
  };

  const topOffset = insets.top + 10;

  return (
    <>
      <DrawerMenu
        visible={drawerOpen}
        currentTab={currentTab}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Parent container — relative, no background, just holds absolutely positioned children */}
      <View style={[styles.container, { height: topOffset + 52 }]} pointerEvents="box-none">

        {/* Center: Brand title — glass chip, absolutely centered */}
        <View style={[styles.centerTitle, { top: topOffset }]} pointerEvents="none">
          <View style={styles.titleChip}>
            {/* Layer 1: Blur background */}
            <BlurView
              tint={isDark ? 'dark' : 'light'}
              intensity={Platform.OS === 'ios' ? (isDark ? 20 : 15) : (isDark ? 10 : 8)}
              style={StyleSheet.absoluteFill}
            />
            {/* Layer 2: Semi-transparent tint */}
            <View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor: Platform.OS === 'ios'
                    ? (isDark ? 'rgba(15, 23, 42, 0.55)' : 'rgba(255, 255, 255, 0.55)')
                    : (isDark ? 'rgba(15, 23, 42, 0.72)' : 'rgba(255, 255, 255, 0.70)'),
                  borderColor: isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(0, 0, 0, 0.06)',
                  borderWidth: 1,
                  borderRadius: 14,
                },
              ]}
            />
            {/* Layer 3: Text — sharp, above blur */}
            <Text style={[styles.brandText, { color: themeColors.text_primary }]}>
              AirSaathi
            </Text>
          </View>
        </View>

        {/* Left: Floating hamburger button */}
        <View style={[styles.leftButton, { top: topOffset }]}>
          <HamburgerToggle
            isOpen={drawerOpen}
            color={themeColors.icons}
            onPress={handleDrawerToggle}
            isDark={isDark}
          />
        </View>

        {/* Right: Floating theme toggle button */}
        <View style={[styles.rightButton, { top: topOffset }]}>
          <ThemeToggle isDark={isDark} color={themeColors.icons} onPress={toggleTheme} />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    // No background — elements float independently
  },

  // ─── Floating button base ────────────────────────────────
  floatingButton: {
    borderRadius: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        // Minimal shadow on iOS — glass look
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        // Subtle elevation for depth on Android
        elevation: 4,
      },
    }),
  },
  floatingButtonContent: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ─── Absolute positions ──────────────────────────────────
  leftButton: {
    position: 'absolute',
    left: 18,
  },
  rightButton: {
    position: 'absolute',
    right: 18,
  },
  centerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleChip: {
    borderRadius: 14,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },

  // ─── Typography ──────────────────────────────────────────
  brandText: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: topNavConfig.topNavBar.brand.fontSize,
    fontWeight: topNavConfig.topNavBar.brand.fontWeight as any,
    letterSpacing: -0.3,
  },
});
