import React from "react";
import { View, Text, StyleSheet, Image, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

import ScreenWrapper from "../../components/ScreenWrapper";
import { useTheme } from "../../context/ThemeContext";
import dsRaw from "../../context/design_system.json";

// Safely resolve the design system object root
const ds = (dsRaw as any).designSystem || dsRaw;

// Reusable scale feedback component for interactive elements
const ScaleFeedback = ({ children, onPress, style }: any) => {
  const scale = useSharedValue(1);
  const targetScale = ds.interactions?.press?.scale || 0.95;
  const timing = ds.interactions?.transitions?.duration || 150;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(targetScale, {
      duration: timing,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, {
      duration: timing,
      easing: Easing.out(Easing.quad),
    });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={style}
    >
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};

const UserHeader = ({ isDark }: { isDark: boolean }) => {
  const textColor = isDark
    ? ds.colors.primary.mint
    : ds.colors.primary.lightText;
  const subTextColor = isDark ? "#94A3B8" : "#475569";
  const badgeColors = {
    bg: isDark ? "rgba(30, 41, 59, 1)" : ds.colors.feedback.action.light,
    icon: isDark ? ds.colors.primary.mint : ds.colors.primary.lightText,
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.avatarWrapper}>
        <View
          style={[
            styles.avatarBorder,
            {
              backgroundColor: isDark
                ? "rgba(30, 41, 59, 0.5)"
                : ds.colors.primary.mint,
            },
          ]}
        >
          <Image
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxOt4pib8-I5tW3IKMuZej3ZeQb0relcQ-Jn1gjpInfoWt59Nea2R-qGJWlqsD2Z5rh4ViyYiToBVJH5p4M3RRI4qaucPiKM_9OhR53ECpgKMjcwvEi1-nyhKS1Lv9XHuQlUq0jnRSSVPSLpwmAv_fPbaH0McWno61hkz1A0mkNLHtNKYedy07sVContz9Au1YXniY4B6UjTNPsdDZGy-F5wgZYWlpBrmKpLQgPqbgbvVCEGz4begrvXErmGTSbw8eU8ICpkUKKgo",
            }}
            style={styles.avatarImage}
          />
        </View>
        <View
          style={[styles.badgeContainer, { backgroundColor: badgeColors.bg }]}
        >
          <Ionicons
            name="checkmark-circle"
            size={16}
            color={badgeColors.icon}
          />
        </View>
      </View>
      <Text style={[styles.userName, { color: textColor }]}>Ananya Sharma</Text>
      <Text style={[styles.userSub, { color: subTextColor }]}>
        Premium Member since 2023
      </Text>
    </View>
  );
};

const ProgressCard = ({ isDark }: { isDark: boolean }) => {
  const bg = isDark
    ? ds.colors.cards.dark.background
    : ds.colors.cards.light.background;
  const borderColor = isDark ? ds.colors.cards.dark.border : "transparent";
  const headingColor = isDark
    ? ds.colors.primary.mint
    : ds.colors.primary.lightText;
  const activeColor = isDark ? ds.colors.primary.mint : "#065F46"; // fallback strict color mappings
  const inactiveColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";
  const labelColor = isDark ? "#94A3B8" : "#64748B";

  const chartData = [
    { day: "MON", val: "60%", active: true },
    { day: "TUE", val: "85%", active: true },
    { day: "WED", val: "95%", active: true, highlight: true },
    { day: "THU", val: "50%", active: true },
    { day: "FRI", val: "75%", active: true },
    { day: "SAT", val: "30%", active: false },
    { day: "SUN", val: "10%", active: false },
  ];

  return (
    <View
      style={[
        styles.cardContainer,
        { backgroundColor: bg, borderColor, borderWidth: isDark ? 1 : 0 },
      ]}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.sectionOverline}>WEEKLY PROGRESS</Text>
          <Text style={[styles.cardTitle, { color: headingColor }]}>
            Actions completed
          </Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.cardStatValue, { color: activeColor }]}>12</Text>
          <Text style={[styles.cardStatSub, { color: labelColor }]}>
            of 15 goal
          </Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        {chartData.map((data, i) => (
          <View key={i} style={styles.chartCol}>
            <View style={[styles.barBg, { backgroundColor: inactiveColor }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    height: data.val as any,
                    backgroundColor: data.highlight
                      ? activeColor
                      : data.active
                        ? isDark
                          ? ds.colors.feedback.action.dark
                          : ds.colors.primary.mint
                        : "transparent",
                  },
                ]}
              />
            </View>
            <Text style={[styles.chartDay, { color: labelColor }]}>
              {data.day}
            </Text>
          </View>
        ))}
      </View>

      <View
        style={[
          styles.ecoBanner,
          {
            backgroundColor: isDark
              ? "rgba(30, 41, 59, 0.6)"
              : ds.colors.feedback.action.light,
          },
        ]}
      >
        <Ionicons name="leaf" size={18} color={activeColor} />
        <Text style={[styles.ecoBannerText, { color: headingColor }]}>
          You saved <Text style={{ fontWeight: "bold" }}>2.4kg</Text> of CO2
          emission this week!
        </Text>
      </View>
    </View>
  );
};

const SettingsItem = ({
  icon,
  title,
  subtitle,
  isDark,
  rightElement,
  isDanger,
  isLast,
  hideArrow,
}: any) => {
  const textColor = isDanger
    ? "#EF4444"
    : isDark
      ? ds.colors.primary.mint
      : ds.colors.primary.lightText;
  const subTextColor = isDark ? "#94A3B8" : "#64748B";
  const iconBg = isDanger
    ? "rgba(239,68,68,0.1)"
    : isDark
      ? "rgba(30, 41, 59, 1)"
      : ds.colors.background.lightSecondary;
  const dividerColor = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)";

  return (
    <View>
      <ScaleFeedback style={styles.settingsItem}>
        <View style={styles.settingsRow}>
          <View
            style={[styles.settingsIconWrapper, { backgroundColor: iconBg }]}
          >
            <Ionicons name={icon} size={20} color={textColor} />
          </View>
          <View style={styles.settingsTextContainer}>
            <Text style={[styles.settingsTitle, { color: textColor }]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={[styles.settingsSub, { color: subTextColor }]}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightElement && (
            <View style={{ marginRight: 8 }}>{rightElement}</View>
          )}
          {!hideArrow && (
            <View style={styles.arrowContainer}>
              <Ionicons name="chevron-forward" size={20} color={subTextColor} />
            </View>
          )}
        </View>
      </ScaleFeedback>
      {!isLast && (
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      )}
    </View>
  );
};

const SettingsList = ({ isDark }: { isDark: boolean }) => {
  const bg = isDark
    ? ds.colors.cards.dark.background
    : ds.colors.cards.light.background;
  const borderColor = isDark ? ds.colors.cards.dark.border : "transparent";

  return (
    <View style={styles.settingsSection}>
      <Text style={styles.sectionOverline}>ACCOUNT SETTINGS</Text>
      <View
        style={[
          styles.settingsCard,
          { backgroundColor: bg, borderColor, borderWidth: isDark ? 1 : 0 },
        ]}
      >
        <SettingsItem
          isDark={isDark}
          icon="notifications-outline"
          title="Notification preferences"
          subtitle="Push, Alerts, Summaries"
        />
        <SettingsItem
          isDark={isDark}
          icon="location-outline"
          title="Location settings"
          subtitle="3 saved addresses"
        />
        <SettingsItem
          isDark={isDark}
          icon="thermometer-outline"
          title="AQI units"
          subtitle="Standard (US EPA)"
          rightElement={
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: isDark
                    ? "rgba(30, 41, 59, 1)"
                    : ds.colors.primary.mint,
                },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  { color: isDark ? ds.colors.primary.mint : "#064E3B" },
                ]}
              >
                US EPA
              </Text>
            </View>
          }
        />
        <SettingsItem
          isDark={isDark}
          isDanger={true}
          isLast={true}
          icon="log-out-outline"
          title="Sign out"
          hideArrow={true}
        />
      </View>
    </View>
  );
};

export default function ProfileScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <ScreenWrapper>
      <UserHeader isDark={isDark} />
      <ProgressCard isDark={isDark} />
      <SettingsList isDark={isDark} />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: { alignItems: "center", marginBottom: 48 },
  avatarWrapper: { position: "relative", marginBottom: 16 },
  avatarBorder: {
    width: 96,
    height: 96,
    borderRadius: 24,
    padding: 4,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 20 },
  badgeContainer: {
    position: "absolute",
    bottom: -4,
    right: -4,
    padding: 6,
    borderRadius: 12,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  userName: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 24,
    fontWeight: ds.typography.styles.headline.fontWeight as any,
    marginBottom: 4,
  },
  userSub: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    fontWeight: "500",
  },

  cardContainer: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 40,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 32,
  },
  sectionOverline: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 11,
    fontWeight: ds.typography.styles.label.fontWeight as any,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: "#94A3B8",
    marginBottom: 8,
    marginLeft: 8,
  },
  cardTitle: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 20,
    fontWeight: ds.typography.styles.headline.fontWeight as any,
  },
  cardStatValue: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 32,
    fontWeight: "800",
  },
  cardStatSub: { fontFamily: ds.typography.fonts.body, fontSize: 14 },

  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 96,
    marginBottom: 24,
    gap: 12,
  },
  chartCol: { flex: 1, alignItems: "center", gap: 8, height: "100%" },
  barBg: {
    width: "100%",
    flex: 1,
    borderRadius: 100,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  barFill: { width: "100%", borderRadius: 100 },
  chartDay: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 10,
    fontWeight: ds.typography.styles.label.fontWeight as any,
  },

  ecoBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  ecoBannerText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    flex: 1,
  },

  settingsSection: { marginBottom: 20 },
  settingsCard: {
    borderRadius: 24,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  settingsItem: { padding: 20 },
  settingsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    width: "100%",
  },
  settingsTextContainer: { flex: 1, marginLeft: 16, minWidth: 0 },
  settingsIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  settingsTitle: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 16,
    fontWeight: "600",
  },
  settingsSub: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 12,
    marginTop: 2,
    opacity: 0.8,
  },
  // removed settingsItemRight, not needed with new layout
  arrowContainer: {
    width: 24,
    alignItems: "flex-end",
    justifyContent: "center",
  },
  divider: { height: 1, marginHorizontal: 20 },

  tag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  tagText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 11,
    fontWeight: "bold",
  },
});
