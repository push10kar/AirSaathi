import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Platform,
  Pressable,
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import designSystem from "../context/design_system.json";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

// ─── Constants ────────────────────────────────────────────────────────────────
const NAVBAR_HEIGHT = 68;   // Fixed content height — never changes
const NAVBAR_RADIUS_TOP = 24;
const INDICATOR_RADIUS = 18;
const ICON_SIZE = 22;
const LABEL_FONT_SIZE = 11;
const ICON_LABEL_GAP = 4;
const TAB_ITEM_WIDTH = 80;  // Fixed width per tab → consistent spacing when scrollable
const SCROLL_PADDING_H = 16; // Horizontal padding inside scroll content

/** Timing config: iOS-like smooth ease-in-out, no spring/bouncy */
const timingConfig = {
  duration: 220,
  easing: Easing.inOut(Easing.ease),
};

// ─── Icon map ─────────────────────────────────────────────────────────────────
const TAB_ICONS: Record<string, { active: any; inactive: any }> = {
  index:     { active: "home",          inactive: "home-outline" },
  community: { active: "people",        inactive: "people-outline" },
  learn:     { active: "book",          inactive: "book-outline" },
  actions:   { active: "flash",         inactive: "flash-outline" },
  alerts:    { active: "notifications", inactive: "notifications-outline" },
  profile:   { active: "person",        inactive: "person-outline" },
};

// ─── TabItem ──────────────────────────────────────────────────────────────────
type TabItemProps = {
  label: string;
  iconNameActive: any;
  iconNameInactive: any;
  isFocused: boolean;
  onPress: () => void;
  themeColors: ReturnType<typeof buildColors>;
};

const TabItem = React.memo(({
  label,
  iconNameActive,
  iconNameInactive,
  isFocused,
  onPress,
  themeColors,
}: TabItemProps) => {
  const focusProgress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    focusProgress.value = withTiming(isFocused ? 1 : 0, timingConfig);
  }, [isFocused]);

  // Cross-fade active ↔ inactive icon — same fixed size so layout never shifts
  const activeIconStyle = useAnimatedStyle(() => ({
    opacity: focusProgress.value,
    position: "absolute",
  }));
  const inactiveIconStyle = useAnimatedStyle(() => ({
    opacity: 1 - focusProgress.value,
    position: "absolute",
  }));

  return (
    <Pressable
      onPress={onPress}
      style={styles.tabItem}
      android_ripple={{ color: themeColors.ripple, borderless: true }}
    >
      {/* Icon container — fixed size so nothing shifts */}
      <View style={styles.iconBox}>
        <Animated.View style={inactiveIconStyle}>
          <Ionicons
            name={iconNameInactive}
            size={ICON_SIZE}
            color={themeColors.inactive_icon}
          />
        </Animated.View>
        <Animated.View style={activeIconStyle}>
          <Ionicons
            name={iconNameActive}
            size={ICON_SIZE}
            color={themeColors.active_icon}
          />
        </Animated.View>
      </View>

      {/* Label — always rendered, same font size. Only color changes */}
      <Animated.Text
        numberOfLines={1}
        style={[
          styles.tabLabel,
          {
            color: isFocused
              ? themeColors.active_label
              : themeColors.inactive_label,
          },
        ]}
      >
        {label}
      </Animated.Text>
    </Pressable>
  );
});

// ─── Color builder ────────────────────────────────────────────────────────────
function buildColors(isDark: boolean, isIOS: boolean) {
  return {
    background: isIOS
      ? isDark
        ? "rgba(15, 23, 42, 0.65)"
        : "rgba(255, 255, 255, 0.68)"
      : isDark
        ? "rgba(15, 23, 42, 0.90)"
        : "rgba(255, 255, 255, 0.88)",
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
    indicator: isDark
      ? designSystem.designSystem.colors.feedback.action.dark
      : "#D1FAE5",
    ripple: isDark ? "rgba(152,216,200,0.12)" : "rgba(6,95,70,0.08)",
  };
}

// ─── TabBar ───────────────────────────────────────────────────────────────────
export default function TabBar({
  state,
  descriptors,
  navigation,
}: MaterialTopTabBarProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const isIOS = Platform.OS === "ios";
  const insets = useSafeAreaInsets();

  const themeColors = buildColors(isDark, isIOS);
  const blurIntensity = isIOS ? (isDark ? 30 : 25) : isDark ? 15 : 10;

  // ── Indicator animation ────────────────────────────────────────────────────
  // We track each tab's x from onLayout — works correctly in a ScrollView
  // because onLayout gives position relative to the scroll content, not screen.
  const scrollViewRef = useRef<ScrollView>(null);

  const indicatorX = useSharedValue(SCROLL_PADDING_H + state.index * TAB_ITEM_WIDTH);

  useEffect(() => {
    const x = SCROLL_PADDING_H + state.index * TAB_ITEM_WIDTH;
    indicatorX.value = withTiming(x, timingConfig);

    // Auto-scroll the active tab into comfortable view
    scrollViewRef.current?.scrollTo({
      x: Math.max(0, x - TAB_ITEM_WIDTH),
      animated: true,
    });
  }, [state.index]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: TAB_ITEM_WIDTH,
  }));

  // ── Shadow ─────────────────────────────────────────────────────────────────
  const shadowProps = Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: isDark ? 0.08 : 0.05,
      shadowRadius: 8,
    },
    android: { elevation: 8 },
  });

  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View
      style={[
        styles.outerContainer,
        { paddingBottom: bottomPad },
        shadowProps,
      ]}
    >
      {/* Blur layer */}
      <BlurView
        tint={isDark ? "dark" : "light"}
        intensity={blurIntensity}
        style={StyleSheet.absoluteFill}
      />

      {/* Tint overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: themeColors.background },
        ]}
      />

      {/* Border overlay */}
      <View
        style={[
          StyleSheet.absoluteFill,
          { borderTopWidth: 1, borderColor: themeColors.border },
        ]}
      />

      {/* Scrollable tab row — fixed height, horizontal scroll */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        decelerationRate="fast"
      >
        {/* Indicator pill — translateX relative to scroll content origin */}
        <Animated.View
          style={[
            styles.indicator,
            { backgroundColor: themeColors.indicator },
            indicatorStyle,
          ]}
          pointerEvents="none"
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const label =
            typeof options.title === "string" ? options.title : route.name;

          const icons = TAB_ICONS[route.name] ?? {
            active: "ellipse",
            inactive: "ellipse-outline",
          };

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

          return (
            <TabItem
              key={route.key}
              label={label}
              iconNameActive={icons.active}
              iconNameInactive={icons.inactive}
              isFocused={isFocused}
              onPress={onPress}
              themeColors={themeColors}
            />
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  outerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: NAVBAR_RADIUS_TOP,
    borderTopRightRadius: NAVBAR_RADIUS_TOP,
    overflow: "hidden",
    // No height here — determined by tabRow + paddingBottom
  },

  scrollView: {
    height: NAVBAR_HEIGHT, // Fixed height — scroll view never resizes
  },

  scrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SCROLL_PADDING_H,
    height: NAVBAR_HEIGHT,
  },

  indicator: {
    position: "absolute",
    top: 8,
    bottom: 8,
    left: 0,
    borderRadius: INDICATOR_RADIUS,
    // width (TAB_ITEM_WIDTH) and translateX applied via animated style
  },

  tabItem: {
    width: TAB_ITEM_WIDTH,        // Consistent fixed width — even spacing guaranteed
    height: NAVBAR_HEIGHT,        // Full-height touch target
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    // Size NEVER changes between active/inactive — no layout jumps
  },

  iconBox: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: ICON_LABEL_GAP,
  },

  tabLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: LABEL_FONT_SIZE,
    fontWeight: "500",
    textAlign: "center",
    // Size NEVER changes between active/inactive — prevents layout jumps
  },
});
