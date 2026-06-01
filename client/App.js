import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, StyleSheet, Animated, Dimensions, Text, ScrollView } from 'react-native';
import { useFonts } from 'expo-font';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { theme } from './src/theme';
import { ThemeProvider, useAppTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import ThemeTransitionOverlay from './src/components/ThemeTransitionOverlay';
import { LocationProvider } from './src/context/LocationContext';
import AuthModal from './src/components/AuthModal';

import DashboardScreen from './src/screens/DashboardScreen';
import ActionScreen from './src/screens/ActionScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LearnScreen from './src/screens/LearnScreen';
import AlertScreen from './src/screens/AlertScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import BottomNavBar from './src/components/BottomNavBar';
import FullScreenMenu from './src/components/FullScreenMenu';
import TopAppBar from './src/components/TopAppBar';
import LogoutModal from './src/components/LogoutModal';
import ReportModal from './src/components/ReportModal';
import LocationControlModal from './src/components/LocationControlModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Placeholder screen for new tabs
const PlaceholderScreen = ({ title }) => {
  const { theme } = useAppTheme();
  const styles = getStyles(theme);

  return (
    <View style={styles.placeholderContainer}>
      <View style={styles.placeholderContent}>
        <Text style={styles.placeholderTitle}>{title}</Text>
        <Text style={styles.placeholderText}>This section is coming soon!</Text>
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
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [reportVisible, setReportVisible] = useState(false);
  const [locationVisible, setLocationVisible] = useState(false);
  const [adminDashboardVisible, setAdminDashboardVisible] = useState(false);
  const { user, logout, token } = useAuth();
  const { isTransitioning, targetDarkMode } = useAppTheme();
  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef(null);

  const handleMenuPress = useCallback(() => {
    if (!menuVisible) setMenuVisible(true);
  }, [menuVisible]);
  const handleTabPress = useCallback((index) => {
    scrollViewRef.current?.scrollTo({ x: index * SCREEN_WIDTH, animated: true });
    setActiveIndex(index);
  }, []);

  const handleLogout = useCallback(() => {
    setLogoutVisible(false);
    logout();
  }, [logout]);

  const handleScroll = useMemo(() => Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false }
  ), [scrollX]);

  const handleMomentumScrollEnd = useCallback((event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setActiveIndex(index);
  }, []);

  const screens = useMemo(() => {
    const baseScreens = [
      <DashboardScreen key="dashboard" />,
      <LearnScreen key="learn" onNavigateToAction={() => handleTabPress(3)} />,
      <CommunityScreen key="community" />,
      <ActionScreen key="action" />,
      <AlertScreen key="alerts" />,
      <ProfileScreen key="profile" onLogoutRequest={() => setLogoutVisible(true)} />
    ];
    if (user?.role === 'admin') {
      return [
        ...baseScreens.slice(0, 5),
        <AdminDashboardScreen key="admin" isEmbedded={true} />,
        ...baseScreens.slice(5)
      ];
    }
    return baseScreens;
  }, [handleTabPress, user]);

  if (!fontsLoaded) {
    return <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background.primary }]} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopAppBar 
        onMenuPress={handleMenuPress} 
        onProfilePress={() => handleTabPress(user?.role === 'admin' ? 6 : 5)}
        onStreakPress={() => handleTabPress(3)}
        onLocationPress={() => setLocationVisible(true)}
        user={user}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        style={styles.pagerContainer}
      >
        {screens.map((screen, index) => (
          <View key={index} style={styles.screenWrapper}>
            {screen}
          </View>
        ))}
      </Animated.ScrollView>

      <BottomNavBar 
        scrollX={scrollX}
        activeIndex={activeIndex}
        onTabPress={handleTabPress}
      />
      
      <FullScreenMenu 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)}
        onNavigate={handleTabPress}
        onLogout={() => setLogoutVisible(true)}
        onReport={() => setReportVisible(true)}
        onLocation={() => setLocationVisible(true)}
        onAdminPress={() => {
          if (user?.role === 'admin') {
            handleTabPress(5);
          } else {
            setAdminDashboardVisible(true);
          }
        }}
      />

      <ThemeTransitionOverlay 
        visible={isTransitioning} 
        targetDarkMode={targetDarkMode} 
      />

      <LogoutModal
        visible={logoutVisible}
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
        theme={theme}
      />

      <ReportModal
        visible={reportVisible}
        onClose={() => setReportVisible(false)}
        token={token}
      />

      <LocationControlModal
        visible={locationVisible}
        onClose={() => setLocationVisible(false)}
      />

      <AdminDashboardScreen
        visible={adminDashboardVisible}
        onClose={() => setAdminDashboardVisible(false)}
      />
    </SafeAreaView>
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
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  pagerContainer: {
    flex: 1,
  },
  screenWrapper: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  placeholderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
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
    color: theme.colors.text.primary,
    marginBottom: 16,
  },
  placeholderText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 16,
    color: theme.colors.text.secondary,
  }
});
