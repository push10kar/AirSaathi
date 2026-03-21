import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import designSystem from "../context/design_system.json";
import { useTheme } from "../context/ThemeContext";

type QuizOption = {
  id: string;
  text: string;
};

type QuizWidgetProps = {
  question: string;
  options: QuizOption[];
  correctAnswerId: string;
  onSelect?: (optionId: string) => void;
  showFeedback?: boolean;
};

export default function QuizWidget({
  question,
  options,
  correctAnswerId,
  onSelect,
  showFeedback = true,
}: QuizWidgetProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

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
  const correctBg = isDark
    ? "rgba(16, 185, 129, 0.15)"
    : designSystem.designSystem.colors.feedback.action.light;
  const correctBorder = designSystem.designSystem.colors.primary.mint;
  const incorrectBg = isDark
    ? "rgba(239, 68, 68, 0.15)"
    : designSystem.designSystem.colors.feedback.complaint.light;
  const incorrectBorder = isDark ? "#EF4444" : "#DC2626";

  const handleSelectOption = (optionId: string) => {
    setSelectedOption(optionId);
    setShowResult(true);
    onSelect?.(optionId);
  };

  const isCorrect = selectedOption === correctAnswerId;

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
    >
      {/* Question */}
      <Text style={[styles.question, { color: textPrimary }]}>{question}</Text>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = selectedOption === option.id;
          const isCorrectOption = option.id === correctAnswerId;

          let optionBg = isDark ? "rgba(51, 65, 85, 0.5)" : "#F8FAFC";
          let optionBorder = isDark ? "rgba(71, 85, 105, 0.3)" : "#E2E8F0";
          let optionBorderWidth = 1;

          if (showResult && isSelected) {
            if (isCorrect) {
              optionBg = correctBg;
              optionBorder = correctBorder;
              optionBorderWidth = 2;
            } else {
              optionBg = incorrectBg;
              optionBorder = incorrectBorder;
              optionBorderWidth = 2;
            }
          } else if (
            showResult &&
            isCorrectOption &&
            !isSelected &&
            !isCorrect
          ) {
            optionBg = correctBg;
            optionBorder = correctBorder;
            optionBorderWidth = 2;
          }

          return (
            <Pressable
              key={option.id}
              onPress={() =>
                !showFeedback && !showResult && handleSelectOption(option.id)
              }
              disabled={showResult}
              style={styles.optionPressable}
            >
              <Animated.View
                style={[
                  styles.option,
                  {
                    backgroundColor: optionBg,
                    borderColor: optionBorder,
                    borderWidth: optionBorderWidth,
                  },
                ]}
              >
                {/* Radio Circle */}
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor: isSelected ? correctBorder : textSecondary,
                      backgroundColor: isSelected
                        ? correctBorder
                        : "transparent",
                    },
                  ]}
                >
                  {isSelected && (
                    <View
                      style={[
                        styles.radioInner,
                        {
                          backgroundColor: isDark ? cardBg : "#FFFFFF",
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Option Text */}
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: textPrimary,
                      fontWeight: isSelected ? "600" : "400",
                    },
                  ]}
                  numberOfLines={2}
                >
                  {option.text}
                </Text>

                {/* Feedback Icon */}
                {showResult && isSelected && (
                  <Ionicons
                    name={isCorrect ? "checkmark-circle" : "close-circle"}
                    size={20}
                    color={isCorrect ? correctBorder : incorrectBorder}
                  />
                )}
                {showResult && isCorrectOption && !isSelected && !isCorrect && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={correctBorder}
                  />
                )}
              </Animated.View>
            </Pressable>
          );
        })}
      </View>

      {/* Result Message */}
      {showResult && (
        <View
          style={[
            styles.resultContainer,
            {
              backgroundColor: isCorrect ? correctBg : incorrectBg,
              borderColor: isCorrect ? correctBorder : incorrectBorder,
            },
          ]}
        >
          <Ionicons
            name={isCorrect ? "checkmark-circle" : "information-circle"}
            size={16}
            color={isCorrect ? correctBorder : incorrectBorder}
          />
          <Text
            style={[
              styles.resultText,
              { color: isCorrect ? correctBorder : incorrectBorder },
            ]}
          >
            {isCorrect ? "Correct!" : "Try again!"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: designSystem.designSystem.colors.cards.light.borderRadius,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  question: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 16,
    fontWeight: designSystem.designSystem.typography.styles.headline
      .fontWeight as any,
    marginBottom: 16,
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  optionPressable: {
    width: "100%",
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  radioInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  optionText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  resultContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 10,
    borderWidth: 1,
  },
  resultText: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: "600",
  },
});
