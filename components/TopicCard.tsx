import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ImageSourcePropType,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import designSystem from "../context/design_system.json";
import { useTheme } from "../context/ThemeContext";

type TopicCardProps = {
  title: string;
  description: string;
  icon?: keyof typeof Ionicons.glyphMap;
  image?: ImageSourcePropType;
  onPress?: () => void;
  category?: string;
};

const timingConfig = { duration: 150, easing: Easing.out(Easing.cubic) };

export default function TopicCard({
  title,
  description,
  icon,
  image,
  onPress,
  category,
}: TopicCardProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const scale = useSharedValue(1);

  const cardBg = isDark
    ? designSystem.designSystem.colors.cards.dark.background
    : designSystem.designSystem.colors.cards.light.background;
  const cardBorder = isDark
    ? designSystem.designSystem.colors.cards.dark.border
    : "transparent";
  const textPrimary = isDark
    ? "#F1F5F9"
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const categoryColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : designSystem.designSystem.colors.primary.lightText;
  const iconBg = isDark
    ? "rgba(152, 216, 200, 0.1)"
    : designSystem.designSystem.colors.feedback.action.light;
  const iconColor = isDark
    ? designSystem.designSystem.colors.primary.mint
    : "#065F46";
  const chevronColor = isDark ? "#475569" : "#94A3B8";

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, timingConfig);
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, timingConfig);
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={[
          styles.card,
          animatedScale,
          {
            backgroundColor: cardBg,
            borderColor: cardBorder,
            borderWidth: isDark ? 1 : 0,
          },
        ]}
      >
        {/* Image or Icon Container */}
        {image ? (
          <View style={styles.imageContainer}>
            <Image source={image} style={styles.image} />
          </View>
        ) : icon ? (
          <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
            <Ionicons name={icon} size={28} color={iconColor} />
          </View>
        ) : null}

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {category && (
            <Text style={[styles.category, { color: categoryColor }]}>
              {category.toUpperCase()}
            </Text>
          )}
          <Text
            style={[styles.title, { color: textPrimary }]}
            numberOfLines={2}
          >
            {title}
          </Text>
          <Text
            style={[styles.description, { color: textSecondary }]}
            numberOfLines={2}
          >
            {description}
          </Text>
        </View>

        {/* Chevron */}
        <View style={styles.chevronContainer}>
          <Ionicons name="chevron-forward" size={20} color={chevronColor} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    padding: 16,
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  imageContainer: {
    width: 72,
    height: 72,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
  },
  category: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 4,
    textTransform: "uppercase",
  },
  title: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 14,
    fontWeight: designSystem.designSystem.typography.styles.headline
      .fontWeight as any,
    marginBottom: 4,
  },
  description: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    lineHeight: 16,
  },
  chevronContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
});
