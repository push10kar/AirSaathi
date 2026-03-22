import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import navConfig from "../context/navigation.json";
import designSystem from "../context/design_system.json";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

type Layouts = {
  [key: number]: { x: number; y: number; width: number; height: number };
};

const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
  index: { active: "home", inactive: "home-outline" },
  community: { active: "people", inactive: "people-outline" },
  learn: { active: "book", inactive: "book-outline" },
  actions: { active: "flash", inactive: "flash-outline" },
  alerts: { active: "notifications", inactive: "notifications-outline" },
  profile: { active: "person", inactive: "person-outline" },
};

const navTokens = navConfig.navigation.bottomNavBar;
// Custom layout constants for refinement
const NAVBAR_RADIUS_TOP = 24;
const INDICATOR_RADIUS = 18;
const timingConfig = { duration: 150, easing: Easing.out(Easing.cubic) };

const TabItem = ({
  label,
  iconNameActive,
  iconNameInactive,
  isFocused,
  onPress,
  themeColors,
  onLayout,
}: any) => {
  const scale = useSharedValue(1);
  const opacityFocused = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    opacityFocused.value = withTiming(isFocused ? 1 : 0, timingConfig);
  }, [isFocused]);

  const handlePressIn = () => {
    scale.value = withTiming(0.92, timingConfig);
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, timingConfig);
  };

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const activeStyle = useAnimatedStyle(() => ({
    opacity: opacityFocused.value,
  }));

  const inactiveStyle = useAnimatedStyle(() => ({
    opacity: 1 - opacityFocused.value,
  }));

  return (
    <View onLayout={onLayout} style={styles.tabItemWrapper}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.tabItemContainer}
      >
        <Animated.View style={[styles.tabItem, animatedScale]}>
          <View style={styles.iconContainer}>
            <Animated.View style={[{ position: "absolute" }, inactiveStyle]}>
              <Ionicons
                name={iconNameInactive}
                size={navTokens.tabItem.iconSize || 22}
                color={themeColors.inactive_icon}
              />
            </Animated.View>
            <Animated.View style={[activeStyle]}>
              <Ionicons
                name={iconNameActive}
                size={navTokens.tabItem.iconSize || 22}
                color={themeColors.active_icon}
              />
            </Animated.View>
          </View>

          <Animated.Text
            style={[
              styles.tabLabel,
              {
                color: isFocused
                  ? themeColors.active_label
                  : themeColors.inactive_label,
              },
            ]}
            numberOfLines={1}
          >
            {label}
          </Animated.Text>
        </Animated.View>
      </Pressable>
    </View>
  );
};

export default function TabBar({
  state,
  descriptors,
  navigation,
  position,
}: MaterialTopTabBarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const isIOS = Platform.OS === "ios";

  // Navigation and Layout State
  const scrollViewRef = useRef<ScrollView>(null);
  const [layouts, setLayouts] = useState<Layouts>({});
  const [containerWidth, setContainerWidth] = useState(0);

  const themeColors = {
    // Tint matches top navbar system — slightly stronger for grounded depth feel
    background: isIOS
      ? isDark
        ? "rgba(15, 23, 42, 0.65)"
        : "rgba(255, 255, 255, 0.68)"
      : isDark
        ? "rgba(15, 23, 42, 0.88)"
        : "rgba(255, 255, 255, 0.85)",
    border: isDark ? "rgba(148, 163, 184, 0.15)" : "rgba(0, 0, 0, 0.08)",
    active_icon: isDark
      ? designSystem.designSystem.colors.primary.mint
      : "#065F46",
    inactive_icon: isDark
      ? designSystem.designSystem.colors.primary.darkText
      : "#64748B",
    active_label: isDark
      ? designSystem.designSystem.colors.primary.mint
      : "#065F46",
    inactive_label: isDark
      ? designSystem.designSystem.colors.primary.darkText
      : "#64748B",
    border_top: isDark
      ? designSystem.designSystem.colors.cards.dark.border
      : "rgba(0, 0, 0, 0.05)",
    active_indicator_bg: isDark
      ? designSystem.designSystem.colors.feedback.action.dark
      : "#D1FAE5",
  };

  const blurIntensity = isIOS ? (isDark ? 30 : 25) : isDark ? 15 : 10;

  const shadowProps = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.08 : 0.05,
      shadowRadius: 8,
    },
    android: {
      elevation: 8,
    },
  });

  // Animated Indicator Style
  const indicatorAnimatedStyle = useAnimatedStyle(() => {
    if (Object.keys(layouts).length !== state.routes.length) {
      return { opacity: 0 };
    }
    const layout = layouts[state.index];
    if (!layout) return { opacity: 0 };

    return {
      width: withTiming(layout.width, timingConfig),
      height: withTiming(layout.height, timingConfig),
      transform: [
        { translateX: withTiming(layout.x, timingConfig) },
        { translateY: withTiming(layout.y, timingConfig) },
      ],
    };
  });

  // Synchronize ScrollView on tab change
  useEffect(() => {
    if (Object.keys(layouts).length === state.routes.length) {
      const layout = layouts[state.index];
      if (layout && scrollViewRef.current && containerWidth > 0) {
        const scrollToX = layout.x - containerWidth / 2 + layout.width / 2;
        scrollViewRef.current.scrollTo({
          x: Math.max(0, scrollToX),
          animated: true,
        });
      }
    }
  }, [state.index, layouts, containerWidth]);

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingBottom: insets.bottom },
        shadowProps,
      ]}
    >
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={blurIntensity}
        style={StyleSheet.absoluteFill}
      />

      <View
        style={[
          styles.glassTintOverlay,
          { backgroundColor: themeColors.background },
        ]}
      />

      <View
        style={[
          styles.glassTintOverlay,
          {
            borderColor: themeColors.border,
            borderWidth: 1,
          },
        ]}
      />

      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
        onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      >
        {Object.keys(layouts).length === state.routes.length && (
          <Animated.View
            style={[
              {
                position: "absolute",
                left: 0,
                top: 0,
                borderRadius: INDICATOR_RADIUS,
                backgroundColor: themeColors.active_indicator_bg,
              },
              indicatorAnimatedStyle,
            ]}
          />
        )}

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label = options.title !== undefined ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const icons = TAB_ICONS[route.name] || {
            active: "ellipse",
            inactive: "ellipse-outline",
          };

          return (
            <TabItem
              key={route.key}
              route={route}
              index={index}
              isFocused={isFocused}
              label={label}
              iconNameActive={icons.active}
              iconNameInactive={icons.inactive}
              onPress={onPress}
              themeColors={themeColors}
              onLayout={(e: LayoutChangeEvent) => {
                const { x, y, width, height } = e.nativeEvent.layout;
                setLayouts((prev) => ({
                  ...prev,
                  [index]: { x, y, width, height },
                }));
              }}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: NAVBAR_RADIUS_TOP,
    borderTopRightRadius: NAVBAR_RADIUS_TOP,
    overflow: "hidden",
  },
  glassTintOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    alignItems: "center",
    paddingHorizontal: 18,
    gap: 10,
    height: navTokens.container.height,
    justifyContent: "center",
  },
  tabItemWrapper: {
    justifyContent: "center",
    alignItems: "center",
  },
  tabItemContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabItem: {
    minWidth: navTokens.tabs.itemMinWidth || 64,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: INDICATOR_RADIUS,
  },
  iconContainer: {
    marginBottom: navTokens.tabItem.labelSpacing - 2,
    marginTop: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  tabLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: designSystem.designSystem.typography.styles.label
      .fontWeight as any,
    textTransform: designSystem.designSystem.typography.styles.label.uppercase
      ? "uppercase"
      : "none",
    textAlign: "center",
  },
});
