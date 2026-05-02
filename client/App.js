import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider } from './src/context/AuthContext';
import { LocationProvider } from './src/context/LocationContext';
import AuthModal from './src/components/AuthModal';

import DashboardScreen from './src/screens/DashboardScreen';
import ActionScreen from './src/screens/ActionScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import BottomNavBar, { TABS } from './src/components/BottomNavBar';
import FullScreenMenu from './src/components/FullScreenMenu';
import TopAppBar from './src/components/TopAppBar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder screen for new tabs
const PlaceholderScreen = ({ title }) => {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderText}>This section is under construction.</Text>
      </View>
    </View>
  );
};

function AppContent() {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme);
  const [fontsLoaded] = useFonts({
    'Inter_400Regular': require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    'Inter_500Medium': require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    'Inter_600SemiBold': require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
    'Inter_700Bold': require('@expo-google-fonts/inter/700Bold/Inter_700Bold.ttf'),
    'SpaceGrotesk_700Bold': require('@expo-google-fonts/space-grotesk/700Bold/SpaceGrotesk_700Bold.ttf'),
    'SpaceGrotesk_500Medium': require('@expo-google-fonts/space-grotesk/500Medium/SpaceGrotesk_500Medium.ttf'),
    'SpaceGrotesk_400Regular': require('@expo-google-fonts/space-grotesk/400Regular/SpaceGrotesk_400Regular.ttf'),
  });

  const [activeIndex, setActiveIndex] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  if (!fontsLoaded) {
    return <View style={styles.loadingContainer} />;
  }

  const handleMenuPress = () => setMenuVisible(true);

  const handleTabPress = (index) => {
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false } // Required false for interpolation on non-transform properties if any
  );

  const handleMomentumScrollEnd = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        
        {/* Sticky Top App Bar */}
        <TopAppBar onMenuPress={handleMenuPress} />

        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleMomentumScrollEnd}
          style={styles.pagerContainer}
        >
          {/* 1. Home */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <DashboardScreen />
          </View>
          
          {/* 2. Learn */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <PlaceholderScreen title="Learn" />
          </View>
          
          {/* 3. Community */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <CommunityScreen />
          </View>
          
          {/* 4. Action */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <ActionScreen />
          </View>
          
          {/* 5. Alerts */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <PlaceholderScreen title="Alerts" />
          </View>
          
          {/* 6. Profile */}
          <View style={{ width: SCREEN_WIDTH, flex: 1 }}>
            <ProfileScreen />
          </View>
        </Animated.ScrollView>

        <BottomNavBar 
          scrollX={scrollX}
          activeIndex={activeIndex}
          onTabPress={handleTabPress}
        />
        
        <FullScreenMenu 
          visible={menuVisible} 
          onClose={() => setMenuVisible(false)} 
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <LocationProvider>
            <AppContent />
            <AuthModal />
          </LocationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const getStyles = (theme) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: theme.colors?.background?.primary || theme.colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors?.background?.primary || theme.colors.background,
  },
  pagerContainer: {
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: theme.colors?.background?.primary || theme.colors.background,
  },
  placeholderContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  placeholderTitle: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 28,
    color: theme.colors?.text?.primary || theme.colors['on-surface'],
    marginBottom: 16,
  },
  placeholderText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 16,
    color: theme.colors?.text?.secondary || theme.colors.outline,
  }
});
