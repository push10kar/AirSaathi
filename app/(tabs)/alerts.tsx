import React from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/ThemeContext";
import dsRaw from "../../context/design_system.json";

const ds = (dsRaw as any).designSystem || dsRaw;

// ─── Severity Tokens ────────────────────────────────────────────────
// Mapped strictly from design_system.json feedback colors + Stitch layout
const SEVERITY = {
  high: {
    light: { cardBg: "rgba(255, 218, 214, 0.3)", iconBg: "rgba(186, 26, 26, 0.1)", accent: "#BA1A1A", title: "#93000A", label: "#BA1A1A" },
    dark:  { cardBg: ds.colors.feedback.complaint.dark, iconBg: "rgba(186, 26, 26, 0.2)", accent: "#FF897D", title: "#FFDAD6", label: "#FF897D" },
  },
  medium: {
    light: { cardBg: "#FFFFFF", iconBg: "rgba(53, 101, 117, 0.15)", accent: "#356575", title: "#3C6B7B", label: "#356575" },
    dark:  { cardBg: ds.colors.cards.dark.background, iconBg: "rgba(53, 101, 117, 0.25)", accent: "#9ECEE0", title: "#BAEAFD", label: "#9ECEE0" },
  },
  low: {
    light: { cardBg: "rgba(167, 216, 169, 0.2)", iconBg: "rgba(60, 104, 66, 0.1)", accent: "#3C6842", title: "#335F3A", label: "#3C6842" },
    dark:  { cardBg: ds.colors.feedback.action.dark, iconBg: "rgba(60, 104, 66, 0.2)", accent: "#A2D3A4", title: "#BDEFBE", label: "#A2D3A4" },
  },
};

// ─── Mock Alert Data (from Stitch HTML) ─────────────────────────────
const ALERTS_DATA = [
  {
    id: "1",
    severity: "high" as const,
    statusLabel: "Active Now",
    title: "High Pollution Warning — AQI 150",
    description: "Fine particulate matter (PM2.5) levels have spiked in your current location. Air quality is considered unhealthy for sensitive groups.",
    timestamp: "10:45 AM",
    icon: "warning-outline" as const,
    actionIcon: "information-circle-outline" as const,
    actionLabel: "Suggested Action",
    actionText: "Limit outdoor activity",
  },
  {
    id: "2",
    severity: "medium" as const,
    statusLabel: "Forecast Alert",
    title: "Elevated Pollen Levels",
    description: "Expect higher concentrations of seasonal allergens throughout the afternoon. Winds are carrying dust from the western corridor.",
    timestamp: "Today, 08:30 AM",
    icon: "cloud-outline" as const,
    actionIcon: "browsers-outline" as const,
    actionLabel: "Suggested Action",
    actionText: "Keep windows closed during midday",
  },
  {
    id: "3",
    severity: "low" as const,
    statusLabel: "Resolved",
    title: "Air Quality Improved — AQI 42",
    description: 'The heavy smog layer has dissipated following the overnight rain. Air quality is now "Good" and safe for all outdoor activities.',
    timestamp: "Yesterday",
    icon: "checkmark-circle-outline" as const,
    actionIcon: "leaf-outline" as const,
    actionLabel: "Activity Tip",
    actionText: "Perfect time for a morning run",
  },
];

// ─── ScaleFeedback ──────────────────────────────────────────────────
const ScaleFeedback = ({ children, onPress, style }: any) => {
  const scale = useSharedValue(1);
  const targetScale = ds.interactions?.press?.scale || 0.95;
  const timing = ds.interactions?.transitions?.duration || 150;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(targetScale, { duration: timing, easing: Easing.out(Easing.quad) });
  };
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: timing, easing: Easing.out(Easing.quad) });
  };
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) onPress();
  };

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} style={style}>
      <Animated.View style={animatedStyle}>{children}</Animated.View>
    </Pressable>
  );
};

// ─── AlertItem Component ────────────────────────────────────────────
const AlertItem = ({ item, isDark, index }: any) => {
  const sev = SEVERITY[item.severity as keyof typeof SEVERITY];
  const tokens = isDark ? sev.dark : sev.light;

  const subTextClr = isDark ? "rgba(255,255,255,0.7)" : "#3F4946";
  const actionCardBg = isDark ? "rgba(15, 23, 42, 0.5)" : item.severity === "medium" ? "#F2F4F5" : "#FFFFFF";
  const actionSecondaryIconBg = isDark ? "rgba(53, 101, 117, 0.3)" : "#BAEAFD";
  const actionIconBg = item.severity === "low"
    ? (isDark ? "rgba(60, 104, 66, 0.3)" : "#BDEFBE")
    : actionSecondaryIconBg;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify().damping(14).stiffness(100)}>
      <ScaleFeedback>
        <View style={[styles.alertCard, { backgroundColor: tokens.cardBg }]}>
          {/* Header Row */}
          <View style={styles.alertHeader}>
            <View style={styles.alertHeaderLeft}>
              <View style={[styles.iconCircle, { backgroundColor: tokens.iconBg }]}>
                <Ionicons name={item.icon} size={22} color={tokens.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusLabel, { color: tokens.label }]}>{item.statusLabel}</Text>
                <Text style={[styles.alertTitle, { color: tokens.title }]}>{item.title}</Text>
              </View>
            </View>
            <Text style={[styles.timestamp, { color: subTextClr }]}>{item.timestamp}</Text>
          </View>

          {/* Description */}
          <Text style={[styles.alertDescription, { color: subTextClr }]}>{item.description}</Text>

          {/* Suggested Action Sub-Card */}
          <View style={[styles.actionSubCard, { backgroundColor: actionCardBg }]}>
            <View style={[styles.actionSubIcon, { backgroundColor: actionIconBg }]}>
              <Ionicons name={item.actionIcon} size={16} color={isDark ? tokens.label : tokens.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionSubLabel, { color: tokens.label }]}>{item.actionLabel}</Text>
              <Text style={[styles.actionSubText, { color: isDark ? "#FFFFFF" : "#191C1D" }]}>{item.actionText}</Text>
            </View>
          </View>
        </View>
      </ScaleFeedback>
    </Animated.View>
  );
};

// ─── Notification Settings Card ─────────────────────────────────────
const NotificationSettingsCard = ({ isDark }: { isDark: boolean }) => {
  const bg = isDark ? ds.colors.cards.dark.background : "#F2F4F5";
  const titleClr = isDark ? "#FFFFFF" : "#191C1D";
  const subClr = isDark ? "rgba(255,255,255,0.7)" : "#3F4946";

  return (
    <ScaleFeedback>
      <View style={[styles.notifCard, { backgroundColor: bg }]}>
        <Text style={[styles.notifTitle, { color: titleClr }]}>Notification Settings</Text>
        <Text style={[styles.notifSub, { color: subClr }]}>
          Customise which air quality events trigger a push notification on your device.
        </Text>
        <View style={[styles.notifBtn, { backgroundColor: ds.colors.primary.mint }]}>
          <Text style={[styles.notifBtnText, { color: isDark ? "#022C22" : "#FFFFFF" }]}>Manage Alerts</Text>
        </View>
      </View>
    </ScaleFeedback>
  );
};

// ─── Main Screen ────────────────────────────────────────────────────
export default function AlertsScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (ds.topNavBar?.height || 56);
  const bgColor = isDark ? ds.colors.background.dark : ds.colors.background.light;
  const headerColor = isDark ? ds.colors.primary.mint : "#064E3B";
  const headerSubText = isDark ? "rgba(255,255,255,0.7)" : "#3F4946";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <FlatList
        data={ALERTS_DATA}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={[styles.headerHero, { paddingTop: headerHeight + 24 }]}>
            <Text style={[styles.heroTitle, { color: headerColor }]}>Alerts</Text>
            <Text style={[styles.heroSub, { color: headerSubText }]}>
              Stay informed about air quality shifts in your vicinity.
            </Text>
          </View>
        }
        ListFooterComponent={<NotificationSettingsCard isDark={isDark} />}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        renderItem={({ item, index }) => <AlertItem item={item} isDark={isDark} index={index} />}
        ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
      />
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  headerHero: { marginBottom: 32, paddingHorizontal: 8 },
  heroTitle: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },

  alertCard: {
    borderRadius: 16,
    padding: 24,
    gap: 16,
  },

  alertHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  alertHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 8,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  statusLabel: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  alertTitle: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 17,
    fontWeight: "700",
  },
  timestamp: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    opacity: 0.6,
    marginTop: 4,
  },
  alertDescription: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    lineHeight: 22,
  },

  actionSubCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 16,
    borderRadius: 16,
  },
  actionSubIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionSubLabel: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  actionSubText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    fontWeight: "600",
  },

  notifCard: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 16,
    marginTop: 24,
  },
  notifTitle: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 18,
    fontWeight: "700",
  },
  notifSub: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  notifBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 100,
    marginTop: 8,
  },
  notifBtnText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 15,
    fontWeight: "700",
  },
});
