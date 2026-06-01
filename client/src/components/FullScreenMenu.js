import React, { useEffect, useRef, useMemo } from 'react';
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

import { useAuth } from '../context/AuthContext';

const ModernThemeToggle = React.memo(({ isDarkMode, onToggle, theme, styles }) => {
  // Use a local state for optimistic UI updates
  const [localDark, setLocalDark] = React.useState(isDarkMode);
  const animatedValue = useRef(new Animated.Value(isDarkMode ? 1 : 0)).current;

  // Sync local state if global state changes from elsewhere
  useEffect(() => {
    if (isDarkMode !== localDark) {
      setLocalDark(isDarkMode);
      Animated.spring(animatedValue, {
        toValue: isDarkMode ? 1 : 0,
        useNativeDriver: true,
        stiffness: 300,
        damping: 25,
      }).start();
    }
  }, [isDarkMode]);

  const handleToggle = () => {
    const newState = !localDark;
    setLocalDark(newState);
    
    // Start animation immediately on the native thread
    Animated.spring(animatedValue, {
      toValue: newState ? 1 : 0,
      useNativeDriver: true,
      stiffness: 300,
      damping: 25,
      mass: 1,
    }).start();

    // Defer the heavy global theme change to the next tick
    // This allows the animation to start instantly without JS thread blockage
    requestAnimationFrame(() => {
      setTimeout(() => {
        onToggle();
      }, 0); 
    });
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 24],
  });

  const darkOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const lightOpacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  return (
    <TouchableOpacity 
      activeOpacity={0.8} 
      onPress={handleToggle}
      style={{ marginRight: 16 }}
    >
      <View style={styles.toggleTrack}>
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: '#E2E8F0', borderRadius: 16, opacity: lightOpacity }
        ]} />
        
        <Animated.View style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: '#1B3321', borderRadius: 16, opacity: darkOpacity }
        ]} />

        <Animated.View style={[
          styles.toggleThumb, 
          { 
            transform: [{ translateX }],
            backgroundColor: localDark ? '#c4ff01' : '#FFFFFF' 
          }
        ]}>
          <Animated.View style={{ opacity: lightOpacity, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="light-mode" size={12} color="#718096" />
          </Animated.View>
          <Animated.View style={{ position: 'absolute', opacity: darkOpacity, alignItems: 'center', justifyContent: 'center' }}>
            <MaterialIcons name="dark-mode" size={12} color="#1B3321" />
          </Animated.View>
        </Animated.View>
      </View>
    </TouchableOpacity>
  );
});

const FullScreenMenu = React.memo(function FullScreenMenu({ 
  visible, 
  onClose, 
  onNavigate = () => {}, 
  onLogout = () => {}, 
  onReport = () => {},
  onLocation = () => {},
  onAdminPress = () => {}
}) {
  const { theme, isDarkMode, toggleTheme } = useAppTheme();
  const { user } = useAuth();
  const styles = useMemo(() => getStyles(theme, isDarkMode), [theme, isDarkMode]);
  
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

  const isAnimating = useRef(false);
  useEffect(() => {
    isAnimating.current = true;
    const timer = setTimeout(() => {
      isAnimating.current = false;
    }, 400); // Wait for spring to settle
    return () => clearTimeout(timer);
  }, [visible]);

  // Dynamically compute the menu sections based on the user's role
  const sections = useMemo(() => {
    console.log('[DEBUG AUTH] FullScreenMenu - Current User:', user ? { email: user.email, role: user.role } : 'Guest');
    if (user?.role === 'admin') {
      return [
        {
          items: [
            { 
              id: 'admin', 
              label: 'Admin Dashboard', 
              icon: 'security', 
              subtitle: 'Moderate community, manage rewards, edit syllabus' 
            }
          ]
        },
        ...MENU_SECTIONS
      ];
    }
    return MENU_SECTIONS;
  }, [user]);

  if (!visible && slideAnim._value === -height) return null;

  const renderItem = (item) => {
    const handlePress = () => {
      if (isAnimating.current) return;
      if (item.id === 'admin') {
        onAdminPress();
        onClose();
      } else if (item.id === 'profile') {
        onNavigate(user?.role === 'admin' ? 6 : 5);
        onClose();
      } else if (item.id === 'progress') {
        onNavigate(3);
        onClose();
      } else if (item.id === 'logout') {
        onLogout();
        onClose();
      } else if (item.id === 'report') {
        onReport();
        onClose();
      } else if (item.id === 'location') {
        onLocation();
        onClose();
      } else {
        // Fallback for others
        console.log(`Menu Item pressed: ${item.id}`);
        onClose();
      }
    };

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.menuItem} 
        activeOpacity={0.6}
        onPress={handlePress}
      >
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
    <Animated.View 
      pointerEvents={visible ? 'auto' : 'none'}
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.container}>
        
        {/* Top Header */}
        <View style={styles.topHeader}>
          <View style={styles.logoContainer}>
            <MaterialIcons name="eco" size={24} color={theme.colors.accent.primary} />
            <Text style={styles.logoText}>AirSaathi</Text>
          </View>
          
          <View style={styles.headerRightSection}>
            <ModernThemeToggle 
              isDarkMode={isDarkMode} 
              onToggle={toggleTheme} 
              theme={theme} 
              styles={styles}
            />
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>CLOSE</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Scrollable Menu */}
        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {sections.map((section, sectionIndex) => (
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
});

export default FullScreenMenu;

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
  headerRightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 20,
    color: theme.colors.text.primary,
    marginLeft: 6,
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
  toggleTrack: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
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
