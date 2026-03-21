import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import designSystem from '../context/design_system.json';
import topNavConfig from '../context/topNav.json';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, interpolate, Extrapolation, runOnJS, useDerivedValue } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;
const timingConfig = { duration: 250, easing: Easing.out(Easing.quad) };

const triggerLightHaptic = () => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
};

const TitleItem = ({ text, textColor }: any) => {
  return (
    <View style={{ marginBottom: 40 }}>
       <Text style={[styles.title, { color: textColor }]}>{text}</Text>
    </View>
  );
};

const MenuItem = ({ icon, text, textColor, onPress }: any) => {
  const handlePress = () => {
    Haptics.selectionAsync();
    if (onPress) onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <View style={styles.menuItem}>
        <Ionicons name={icon} size={26} color={textColor} />
        <Text style={[styles.menuText, { color: textColor }]}>{text}</Text>
      </View>
    </Pressable>
  );
};

const MENU_CONFIG: Record<string, { icon: any; text: string }[]> = {
  index: [
    { icon: "person-circle-outline", text: "Profile" },
    { icon: "options-outline", text: "Preferences" },
    { icon: "map-outline", text: "Air Quality Map" },
    { icon: "help-circle-outline", text: "Support" },
  ],
  community: [
    { icon: "people-outline", text: "My Groups" },
    { icon: "chatbubbles-outline", text: "Discussions" },
    { icon: "create-outline", text: "Create Post" },
    { icon: "bookmark-outline", text: "Saved Posts" },
  ],
  learn: [
    { icon: "book-outline", text: "My Courses" },
    { icon: "bookmark-outline", text: "Saved Articles" },
    { icon: "time-outline", text: "History" },
    { icon: "star-outline", text: "Certificates" },
  ],
  actions: [
    { icon: "list-outline", text: "My Tasks" },
    { icon: "leaf-outline", text: "Impact Log" },
    { icon: "trophy-outline", text: "Leaderboard" },
    { icon: "notifications-outline", text: "Reminders" },
  ],
  alerts: [
    { icon: "notifications-outline", text: "Notification Settings" },
    { icon: "location-outline", text: "Saved Locations" },
    { icon: "warning-outline", text: "Emergency Contacts" },
    { icon: "volume-high-outline", text: "Alert Sounds" },
  ],
  profile: [
    { icon: "person-outline", text: "Edit Profile" },
    { icon: "shield-checkmark-outline", text: "Privacy" },
    { icon: "lock-closed-outline", text: "Security" },
    { icon: "log-out-outline", text: "Log Out" },
  ],
  default: [
    { icon: "home-outline", text: "Home" },
    { icon: "settings-outline", text: "Settings" },
    { icon: "help-circle-outline", text: "Support" }
  ]
};

export default function DrawerMenu({ visible, currentTab, onClose, onOpen }: { visible: boolean, currentTab: string, onClose: () => void, onOpen: () => void }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const insets = useSafeAreaInsets();
  
  const translateX = useSharedValue(visible ? 0 : -DRAWER_WIDTH);
  const isInteracting = useSharedValue(false);

  useEffect(() => {
    if (!isInteracting.value) {
      translateX.value = withTiming(visible ? 0 : -DRAWER_WIDTH, timingConfig);
    }
  }, [visible]);

  const slideAnim = useDerivedValue(() => {
    return interpolate(translateX.value, [-DRAWER_WIDTH, 0], [0, 1], Extrapolation.CLAMP);
  });

  const panGesture = useMemo(() => Gesture.Pan()
    .onStart(() => {
      isInteracting.value = true;
    })
    .onUpdate((e) => {
      let base = visible ? 0 : -DRAWER_WIDTH;
      let newX = base + e.translationX;
      translateX.value = Math.max(-DRAWER_WIDTH, Math.min(0, newX));
    })
    .onEnd((e) => {
      isInteracting.value = false;
      const velocity = e.velocityX;
      const position = translateX.value;
      const shouldOpen = velocity > 500 || (velocity > -500 && position > -DRAWER_WIDTH / 2);

      if (shouldOpen) {
        translateX.value = withTiming(0, timingConfig);
        if (!visible) runOnJS(triggerLightHaptic)();
        runOnJS(onOpen)();
      } else {
        translateX.value = withTiming(-DRAWER_WIDTH, timingConfig);
        if (visible) runOnJS(triggerLightHaptic)();
        runOnJS(onClose)();
      }
    }), [visible, onOpen, onClose]);

  const drawerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(slideAnim.value, [0, 1], [0, 0.5], Extrapolation.CLAMP)
  }));

  const bgColor = isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255, 255, 255, 0.85)';
  const textColor = isDark ? designSystem.designSystem.colors.primary.mint : designSystem.designSystem.colors.primary.lightText;
  const headerOverlapOffset = insets.top + topNavConfig.topNavBar.height + 20;

  const handleDimmerClose = () => {
    triggerLightHaptic();
    onClose();
  };

  const activeMenuItems = MENU_CONFIG[currentTab] || MENU_CONFIG.default;

  return (
    <View style={[StyleSheet.absoluteFill, { zIndex: 90 }]} pointerEvents="box-none">
      {/* Edge Swipe Detector */}
      {!visible && (
        <GestureDetector gesture={panGesture}>
          <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 30, zIndex: 95 }} />
        </GestureDetector>
      )}

      {/* Dimmed Background Overlay */}
      <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: '#000', zIndex: 89 }, backdropStyle]} pointerEvents={visible ? 'auto' : 'none'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleDimmerClose} />
      </Animated.View>

      {/* Slide Out Panel */}
      <GestureDetector gesture={panGesture}>
        <Animated.View 
          style={[
            styles.drawer, 
            { width: DRAWER_WIDTH, zIndex: 90 },
            drawerStyle
          ]}
        >
          <BlurView 
              tint={isDark ? "dark" : "light"} 
              intensity={Platform.OS === 'ios' ? 40 : 100} 
              style={StyleSheet.absoluteFill} 
          >
            <View style={[StyleSheet.absoluteFill, { backgroundColor: bgColor }]} />
            
            <View style={[styles.content, { paddingTop: headerOverlapOffset }]}>
              <TitleItem text="Menu" textColor={textColor} slideAnim={slideAnim} />
              
              {activeMenuItems.map((item, index) => (
                <MenuItem 
                  key={item.text} 
                  delayIndex={index} 
                  slideAnim={slideAnim} 
                  icon={item.icon} 
                  text={item.text} 
                  textColor={textColor} 
                />
              ))}
            </View>
          </BlurView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  drawer: {
    ...StyleSheet.absoluteFillObject,
    right: 'auto',
    borderRightWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(150, 150, 150, 0.3)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 5, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: designSystem.designSystem.typography.fonts.headline,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.15)',
    gap: 16,
  },
  menuText: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: designSystem.designSystem.typography.fonts.body,
  }
});
