import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Platform, Pressable, Animated, ScrollView, useColorScheme, LayoutChangeEvent } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialTopTabBarProps } from '@react-navigation/material-top-tabs';
import { Ionicons } from '@expo/vector-icons';
import navConfig from '../context/navigation.json';
import designSystem from '../context/design_system.json';

type Layouts = { [key: number]: { x: number; width: number } };

const TAB_ICONS: Record<string, { active: any, inactive: any }> = {
  index: { active: 'home', inactive: 'home-outline' },
  community: { active: 'people', inactive: 'people-outline' },
  learn: { active: 'book', inactive: 'book-outline' },
  actions: { active: 'flash', inactive: 'flash-outline' },
  alerts: { active: 'notifications', inactive: 'notifications-outline' },
  profile: { active: 'person', inactive: 'person-outline' },
};

const navTokens = navConfig.navigation.bottomNavBar;

const extractBlur = (filterStr: string) => {
  const match = filterStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 20;
};

const TabItem = ({ route, label, iconNameActive, iconNameInactive, isFocused, onPress, themeColors, positionAnim, index, onLayout }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const inputRange = [index - 1, index, index + 1];

  const color = positionAnim.interpolate({
    inputRange,
    outputRange: [themeColors.inactive_label, themeColors.active_label, themeColors.inactive_label],
    extrapolate: 'clamp',
  });

  const inactiveIconOpacity = positionAnim.interpolate({
    inputRange,
    outputRange: [1, 0, 1],
    extrapolate: 'clamp',
  });

  const activeIconOpacity = positionAnim.interpolate({
    inputRange,
    outputRange: [0, 1, 0],
    extrapolate: 'clamp',
  });

  const animateIn = () => Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  const animateOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <View onLayout={onLayout} style={styles.tabItemWrapper}>
      <Pressable
        onPress={onPress}
        onPressIn={animateIn}
        onPressOut={animateOut}
        style={styles.tabItemContainer}
      >
        <Animated.View style={[
          styles.tabItem,
          { transform: [{ scale }] },
          { paddingHorizontal: 14 } // Consistent padding prevents measuring leaps
        ]}>
          <Animated.View style={[
            StyleSheet.absoluteFill,
            { 
              backgroundColor: themeColors.active_indicator_bg,
              opacity: activeIconOpacity,
              borderRadius: navTokens.container.borderRadius - 4,
            }
          ]} />
          
          <View style={styles.iconContainer}>
            <Animated.View style={{ position: 'absolute', opacity: inactiveIconOpacity }}>
              <Ionicons name={iconNameInactive} size={navTokens.tabItem.iconSize || 22} color={themeColors.inactive_icon} />
            </Animated.View>
            <Animated.View style={{ opacity: activeIconOpacity }}>
              <Ionicons name={iconNameActive} size={navTokens.tabItem.iconSize || 22} color={themeColors.active_icon} />
            </Animated.View>
          </View>

          <Animated.Text style={[styles.tabLabel, { color: color as any }]} numberOfLines={1}>
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default function TabBar({ state, descriptors, navigation, position }: MaterialTopTabBarProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark 
    ? navConfig.navigation_bar_color_system.dark_mode.bottom_nav_bar 
    : navConfig.navigation_bar_color_system.light_mode.bottom_nav_bar;
  
  const blurIntensity = Platform.OS === 'ios' ? extractBlur(themeColors.backdrop_filter) : extractBlur(themeColors.backdrop_filter) * 2;

  const shadowProps = Platform.select({
      ios: {
        shadowColor: isDark ? "#000" : "#0f172a",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 20,
      },
      android: {
        elevation: 12,
      },
  });

  const scrollViewRef = useRef<ScrollView>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [layouts, setLayouts] = useState<Layouts>({});

  // Trigger scroll whenever active tab changes to center the item
  useEffect(() => {
    if (containerWidth > 0 && layouts[state.index]) {
      const targetX = layouts[state.index].x + layouts[state.index].width / 2 - containerWidth / 2;
      scrollViewRef.current?.scrollTo({ x: Math.max(0, targetX), animated: true });
    }
  }, [state.index, containerWidth, layouts]);

  return (
    <View style={[styles.outerContainer, shadowProps]}>
      <BlurView 
        tint={isDark ? "dark" : "light"} 
        intensity={blurIntensity} 
        style={styles.blurContainer}
      >
        <View style={[styles.glassTintOverlay, { backgroundColor: themeColors.background, borderTopColor: themeColors.border_top, borderTopWidth: 1 }]} />
        
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          style={styles.scrollView}
          onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
          {state.routes.map((route, index) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const label = options.title !== undefined ? options.title : route.name;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const icons = TAB_ICONS[route.name] || { active: 'ellipse', inactive: 'ellipse-outline' };

            return (
              <TabItem 
                key={route.key}
                route={route}
                index={index}
                positionAnim={position}
                isFocused={isFocused}
                label={label}
                iconNameActive={icons.active}
                iconNameInactive={icons.inactive}
                onPress={onPress}
                themeColors={themeColors}
                onLayout={(e: LayoutChangeEvent) => {
                  const { x, width } = e.nativeEvent.layout;
                  setLayouts(prev => ({ ...prev, [index]: { x, width } }));
                }}
              />
            );
          })}
        </ScrollView>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: navTokens.container.marginBottom,
    left: navTokens.container.marginHorizontal,
    right: navTokens.container.marginHorizontal,
    height: navTokens.container.height,
    borderRadius: navTokens.container.borderRadius,
    backgroundColor: 'transparent',
  },
  blurContainer: {
    flex: 1,
    borderRadius: navTokens.container.borderRadius,
    overflow: 'hidden',
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: navTokens.tabs.contentPadding,
    gap: navTokens.tabs.itemSpacing,
    // Note: React Native's gap interacts nicely without impacting absolute metrics starting from 0 padding margin bounds inherently inside content container.
    height: '100%',
  },
  tabItemWrapper: {
    // Layout anchor
  },
  tabItemContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    minWidth: navTokens.tabs.itemMinWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: navTokens.tabItem.paddingVertical,
    borderRadius: navTokens.container.borderRadius - 4,
  },
  activeBg: {
    // styling implemented in rendering props to consume themes
  },
  iconContainer: {
    marginBottom: navTokens.tabItem.labelSpacing - 2, 
    marginTop: 2, 
  },
  tabLabel: {
    fontFamily: designSystem.typography.scale.label.fontFamily,
    fontSize: designSystem.typography.scale.label.fontSize,
    fontWeight: designSystem.typography.scale.label.fontWeight as any,
    textTransform: designSystem.typography.scale.label.textTransform as any,
  }
});
