import React, { useState } from "react";
import {
  Text,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import designSystem from "../../context/design_system.json";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useTheme } from "../../context/ThemeContext";
import TopicCard from "../../components/TopicCard";
import QuizWidget from "../../components/QuizWidget";

// ─── Types ────────────────────────────────────────────────────────────────────
type LearningTopic = {
  id: string;
  title: string;
  description: string;
  icon: "leaf" | "alert-circle" | "help-circle" | "bulb" | "shield-checkmark";
  category: string;
};

type QuizItem = {
  id: string;
  question: string;
  options: Array<{ id: string; text: string }>;
  correctAnswerId: string;
  topic: string;
};

// ─── Mock Content Data (mapped from Stitch design structure) ─────────────────
const LEARNING_TOPICS: LearningTopic[] = [
  {
    id: "aqi-101",
    title: "Understanding AQI",
    description:
      "Learn how the Air Quality Index works and what the levels mean",
    icon: "leaf",
    category: "Basics",
  },
  {
    id: "pm-pollution",
    title: "PM2.5 & PM10 Explained",
    description: "What are particulate matters and how do they affect health?",
    icon: "alert-circle",
    category: "Health",
  },
  {
    id: "protection-guide",
    title: "Personal Protection Guide",
    description:
      "Best practices for protecting yourself during poor air quality days",
    icon: "shield-checkmark",
    category: "Protection",
  },
  {
    id: "indoor-air",
    title: "Improving Indoor Air",
    description: "Strategies to maintain clean air quality inside your home",
    icon: "bulb",
    category: "Solutions",
  },
  {
    id: "sources-pollution",
    title: "Sources of Air Pollution",
    description: "Understand where pollution comes from and common sources",
    icon: "help-circle",
    category: "Education",
  },
  {
    id: "climate-impact",
    title: "Climate & Air Quality",
    description: "How seasonal changes and weather affect air pollution levels",
    icon: "leaf",
    category: "Science",
  },
];

const QUIZ_ITEMS: QuizItem[] = [
  {
    id: "quiz-1",
    question: "What does AQI stand for?",
    options: [
      { id: "q1-a", text: "Air Quality Index" },
      { id: "q1-b", text: "Atmospheric Quality Information" },
      { id: "q1-c", text: "Air Quantity Indicator" },
      { id: "q1-d", text: "Ambient Quality Interface" },
    ],
    correctAnswerId: "q1-a",
    topic: "aqi-101",
  },
  {
    id: "quiz-2",
    question: "At what AQI level is outdoor activity not recommended?",
    options: [
      { id: "q2-a", text: "Below 50" },
      { id: "q2-b", text: "51-100" },
      { id: "q2-c", text: "101-200" },
      { id: "q2-d", text: "Above 200" },
    ],
    correctAnswerId: "q2-d",
    topic: "aqi-101",
  },
  {
    id: "quiz-3",
    question: "Which is the most harmful for human health from particles?",
    options: [
      { id: "q3-a", text: "PM100" },
      { id: "q3-b", text: "PM50" },
      { id: "q3-c", text: "PM2.5" },
      { id: "q3-d", text: "All are equally harmful" },
    ],
    correctAnswerId: "q3-c",
    topic: "pm-pollution",
  },
  {
    id: "quiz-4",
    question: "What is the most effective way to improve indoor air quality?",
    options: [
      { id: "q4-a", text: "Use an air purifier" },
      { id: "q4-b", text: "Plant more indoor plants" },
      {
        id: "q4-c",
        text: "Install an air purifier and ensure proper ventilation",
      },
      { id: "q4-d", text: "Keep windows open always" },
    ],
    correctAnswerId: "q4-c",
    topic: "indoor-air",
  },
];

export default function LearnScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [expandedQuizzes, setExpandedQuizzes] = useState<Set<string>>(
    new Set(),
  );

  const textPrimary = isDark
    ? designSystem.designSystem.colors.primary.mint
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? "#94A3B8" : "#475569";
  const bgColor = isDark
    ? designSystem.designSystem.colors.background.dark
    : designSystem.designSystem.colors.background.light;

  const toggleQuizExpanded = (quizId: string) => {
    setExpandedQuizzes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(quizId)) {
        newSet.delete(quizId);
      } else {
        newSet.add(quizId);
      }
      return newSet;
    });
  };

  const handleTopicPress = (topicId: string) => {
    Alert.alert(
      "Topic Selected",
      `You selected: ${LEARNING_TOPICS.find((t) => t.id === topicId)?.title}`,
      [{ text: "OK" }],
    );
  };

  const handleQuizSelect = (quizId: string, optionId: string) => {
    // Handle quiz selection - can be extended for tracking scores
  };

  return (
    <ScreenWrapper>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(0).duration(400)}>
          <View style={styles.headerContainer}>
            <Text style={[styles.title, { color: textPrimary }]}>Learn</Text>
            <Text style={[styles.subtitle, { color: textSecondary }]}>
              Expand your knowledge about air quality
            </Text>
          </View>
        </Animated.View>

        {/* Topics Section */}
        <Animated.View
          entering={FadeInDown.delay(100).duration(400)}
          layout={Layout.springify()}
        >
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              Topics
            </Text>

            {LEARNING_TOPICS.map((topic, index) => (
              <Animated.View
                key={topic.id}
                entering={FadeInDown.delay(200 + index * 50).duration(400)}
                layout={Layout.springify()}
              >
                <TopicCard
                  title={topic.title}
                  description={topic.description}
                  icon={topic.icon}
                  category={topic.category}
                  onPress={() => handleTopicPress(topic.id)}
                />
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Quiz Section */}
        <Animated.View
          entering={FadeInDown.delay(500).duration(400)}
          layout={Layout.springify()}
        >
          <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle, { color: textPrimary }]}>
              Quick Quizzes
            </Text>
            <Text style={[styles.sectionSubtitle, { color: textSecondary }]}>
              Test your knowledge with quick quizzes
            </Text>

            {QUIZ_ITEMS.map((quiz, index) => {
              const isExpanded = expandedQuizzes.has(quiz.id);

              return (
                <Animated.View
                  key={quiz.id}
                  entering={FadeInDown.delay(600 + index * 50).duration(400)}
                  layout={Layout.springify()}
                >
                  <Pressable
                    onPress={() => toggleQuizExpanded(quiz.id)}
                    style={({ pressed }) => [
                      styles.quizHeaderPressable,
                      {
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.quizHeader,
                        {
                          borderColor: isDark
                            ? designSystem.designSystem.colors.cards.dark.border
                            : "#E2E8F0",
                        },
                      ]}
                    >
                      <View style={styles.quizHeaderContent}>
                        <Text
                          style={[
                            styles.quizHeaderTitle,
                            { color: textSecondary },
                          ]}
                        >
                          Quiz: {quiz.topic}
                        </Text>
                        <Text
                          style={[styles.quizQuestion, { color: textPrimary }]}
                        >
                          {quiz.question.substring(0, 50)}
                          {quiz.question.length > 50 ? "..." : ""}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.expandIcon,
                          {
                            color: textSecondary,
                            transform: [
                              { rotate: isExpanded ? "180deg" : "0deg" },
                            ],
                          },
                        ]}
                      >
                        ▼
                      </Text>
                    </View>
                  </Pressable>

                  {isExpanded && (
                    <Animated.View
                      entering={FadeInDown.duration(300)}
                      layout={Layout.springify()}
                    >
                      <QuizWidget
                        question={quiz.question}
                        options={quiz.options}
                        correctAnswerId={quiz.correctAnswerId}
                        onSelect={(optionId) =>
                          handleQuizSelect(quiz.id, optionId)
                        }
                        showFeedback={true}
                      />
                    </Animated.View>
                  )}
                </Animated.View>
              );
            })}
          </View>
        </Animated.View>

        {/* Footer Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    marginBottom: 28,
    marginTop: 8,
  },
  title: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 32,
    fontWeight: designSystem.designSystem.typography.styles.headline
      .fontWeight as any,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionContainer: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 18,
    fontWeight: designSystem.designSystem.typography.styles.headline
      .fontWeight as any,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
    lineHeight: 18,
  },
  quizHeaderPressable: {
    flex: 1,
  },
  quizHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  quizHeaderContent: {
    flex: 1,
    marginRight: 12,
  },
  quizHeaderTitle: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  quizQuestion: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 13,
    fontWeight: designSystem.designSystem.typography.styles.headline
      .fontWeight as any,
    lineHeight: 18,
  },
  expandIcon: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 12,
    fontWeight: "600",
  },
});
