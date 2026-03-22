import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  FlatList,
  Dimensions,
  Platform,
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
const { width } = Dimensions.get("window");

// Data Constants mapped from Stitch HTML
const FILTER_TABS = ["All", "Actions", "Complaints", "Achievements"];

const POSTS_DATA = [
  {
    id: "1",
    author: "Arjun Mehta",
    location: "POWAI, MUMBAI",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4bLleIWu3Hqn5B8IbGe9N2OGN6kYwXjDma5KE9CiU-nHGjzY4cqkmoN2NzK49ZtmxLWkP7m9_fDmqvoZcYIOJguOzbLePU5yYjnW24ks8bnPmXX0tZEw1uSLCrkT9S6DxRspFnGsj05hNLuXcBT_J1lBYfh70Bm7tpeTDjl3aXJEowpXswmfx3Mtah70omp1Qt314N_Y1rGy9FakG7qHs-0Z62yiUiNgam1AS-qZz4XasxDZc9_eJUgjJYKwG3LJLvssnbD-j4k",
    type: "Achievement",
    typeColorLight: { bg: "#baeafd", text: "#3c6b7b" },
    typeColorDark: { bg: "rgba(53, 101, 117, 0.4)", text: "#baeafd" },
    content:
      "Just reached my 1-month milestone of commuting exclusively by electric cycle. The air sensor at my apartment shows a 12% improvement in local PM2.5 levels! 🚴‍♂️🌬️",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4bLleIWu3Hqn5B8IbGe9N2OGN6kYwXjDma5KE9CiU-nHGjzY4cqkmoN2NzK49ZtmxLWkP7m9_fDmqvoZcYIOJguOzbLePU5yYjnW24ks8bnPmXX0tZEw1uSLCrkT9S6DxRspFnGsj05hNLuXcBT_J1lBYfh70Bm7tpeTDjl3aXJEowpXswmfx3Mtah70omp1Qt314N_Y1rGy9FakG7qHs-0Z62yiUiNgam1AS-qZz4XasxDZc9_eJUgjJYKwG3LJLvssnbD-j4k",
    ],
    likes: "124",
    comments: "18",
    timestamp: "2h ago",
  },
  {
    id: "2",
    author: "Sarah Joseph",
    location: "INDIRANAGAR, BLR",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4bLleIWu3Hqn5B8IbGe9N2OGN6kYwXjDma5KE9CiU-nHGjzY4cqkmoN2NzK49ZtmxLWkP7m9_fDmqvoZcYIOJguOzbLePU5yYjnW24ks8bnPmXX0tZEw1uSLCrkT9S6DxRspFnGsj05hNLuXcBT_J1lBYfh70Bm7tpeTDjl3aXJEowpXswmfx3Mtah70omp1Qt314N_Y1rGy9FakG7qHs-0Z62yiUiNgam1AS-qZz4XasxDZc9_eJUgjJYKwG3LJLvssnbD-j4k",
    type: "Action",
    typeColorLight: { bg: "#a7d8a9", text: "#335f3a" },
    typeColorDark: { bg: "rgba(60, 104, 66, 0.4)", text: "#a7d8a9" },
    content:
      "We've just organized a community plant drive. Installed 50 indoor air-purifying plants in our building lobby and shared workspace. Simple steps, big impact. 🌱",
    images: [],
    likes: "89",
    comments: "5",
    timestamp: "5h ago",
  },
  {
    id: "3",
    author: "Michael Ray",
    location: "ROHINI, DELHI",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4bLleIWu3Hqn5B8IbGe9N2OGN6kYwXjDma5KE9CiU-nHGjzY4cqkmoN2NzK49ZtmxLWkP7m9_fDmqvoZcYIOJguOzbLePU5yYjnW24ks8bnPmXX0tZEw1uSLCrkT9S6DxRspFnGsj05hNLuXcBT_J1lBYfh70Bm7tpeTDjl3aXJEowpXswmfx3Mtah70omp1Qt314N_Y1rGy9FakG7qHs-0Z62yiUiNgam1AS-qZz4XasxDZc9_eJUgjJYKwG3LJLvssnbD-j4k",
    type: "Complaint",
    typeColorLight: { bg: "#ffdad6", text: "#93000a" },
    typeColorDark: { bg: "rgba(186, 26, 26, 0.4)", text: "#ffdad6" },
    content:
      "Ongoing construction at the Sector 9 site isn't using water sprinklers for dust control. The AQI in our lane has spiked to 340 this morning. Reporting to local authorities. ⚠️",
    images: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4bLleIWu3Hqn5B8IbGe9N2OGN6kYwXjDma5KE9CiU-nHGjzY4cqkmoN2NzK49ZtmxLWkP7m9_fDmqvoZcYIOJguOzbLePU5yYjnW24ks8bnPmXX0tZEw1uSLCrkT9S6DxRspFnGsj05hNLuXcBT_J1lBYfh70Bm7tpeTDjl3aXJEowpXswmfx3Mtah70omp1Qt314N_Y1rGy9FakG7qHs-0Z62yiUiNgam1AS-qZz4XasxDZc9_eJUgjJYKwG3LJLvssnbD-j4k",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCG4bLleIWu3Hqn5B8IbGe9N2OGN6kYwXjDma5KE9CiU-nHGjzY4cqkmoN2NzK49ZtmxLWkP7m9_fDmqvoZcYIOJguOzbLePU5yYjnW24ks8bnPmXX0tZEw1uSLCrkT9S6DxRspFnGsj05hNLuXcBT_J1lBYfh70Bm7tpeTDjl3aXJEowpXswmfx3Mtah70omp1Qt314N_Y1rGy9FakG7qHs-0Z62yiUiNgam1AS-qZz4XasxDZc9_eJUgjJYKwG3LJLvssnbD-j4k",
    ],
    likes: "241",
    comments: "56",
    timestamp: "8h ago",
  },
];

// Interactive Wrapper
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

// Components
const FilterChip = ({ label, active, onPress, isDark }: any) => {
  const bgActive = ds.colors.primary.mint;
  const bgInactive = isDark ? "rgba(255,255,255,0.1)" : "#e6e8e9"; // surface-container-high equivalent
  const textActive = isDark ? "#022C22" : "#FFFFFF"; // on-primary
  const textInactive = isDark ? ds.colors.primary.mint : "#191c1d"; // on-surface

  return (
    <ScaleFeedback onPress={onPress}>
      <View
        style={[
          styles.chip,
          {
            backgroundColor: active ? bgActive : bgInactive,
            paddingHorizontal: 24,
            paddingVertical: 10,
          },
        ]}
      >
        <Text
          style={[
            styles.chipText,
            { color: active ? textActive : textInactive },
          ]}
        >
          {label}
        </Text>
      </View>
    </ScaleFeedback>
  );
};

const PostCard = ({ item, isDark }: any) => {
  const cardBg = isDark
    ? ds.colors.cards.dark.background
    : ds.colors.cards.light.background;
  const cardBorder = isDark ? ds.colors.cards.dark.border : "rgba(0,0,0,0.05)";
  const textClr = isDark ? "#FFFFFF" : "#191c1d"; // on-surface
  const subTextClr = isDark ? "rgba(255,255,255,0.7)" : "#3f4946"; // on-surface-variant
  const typeBg = isDark ? item.typeColorDark.bg : item.typeColorLight.bg;
  const typeText = isDark ? item.typeColorDark.text : item.typeColorLight.text;

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(12).stiffness(90)}
      style={[
        styles.postCard,
        {
          backgroundColor: cardBg,
          borderColor: cardBorder,
          marginHorizontal: 16,
          marginBottom: 16,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.postAuthorInfo}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          <View>
            <Text style={[styles.authorName, { color: textClr }]}>
              {item.author}
            </Text>
            <View style={styles.locationRow}>
              <Ionicons name="location-sharp" size={12} color={subTextClr} />
              <Text style={[styles.locationText, { color: subTextClr }]}>
                {item.location}
              </Text>
            </View>
          </View>
        </View>
        <View style={[styles.tagBadge, { backgroundColor: typeBg }]}>
          <Text style={[styles.tagText, { color: typeText }]}>{item.type}</Text>
        </View>
      </View>

      {/* Body */}
      <Text style={[styles.postContent, { color: subTextClr }]}>
        {item.content}
      </Text>

      {/* Images */}
      {item.images && item.images.length > 0 && (
        <View
          style={[
            styles.imageGrid,
            { flexDirection: item.images.length > 1 ? "row" : "column" },
          ]}
        >
          {item.images.map((img: string, idx: number) => (
            <View
              key={idx}
              style={{
                flex: 1,
                aspectRatio: 16 / 9,
                marginLeft: idx > 0 ? 8 : 0,
              }}
            >
              <Image
                source={{ uri: img }}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 12,
                  resizeMode: "cover",
                }}
              />
            </View>
          ))}
        </View>
      )}

      {/* Footer */}
      <View style={styles.postFooter}>
        <View style={styles.actionRow}>
          <ScaleFeedback style={styles.actionBtn}>
            <Ionicons name="heart-outline" size={20} color={subTextClr} />
            <Text style={[styles.actionText, { color: subTextClr }]}>
              {item.likes}
            </Text>
          </ScaleFeedback>
          <ScaleFeedback style={styles.actionBtn}>
            <Ionicons name="chatbubble-outline" size={20} color={subTextClr} />
            <Text style={[styles.actionText, { color: subTextClr }]}>
              {item.comments}
            </Text>
          </ScaleFeedback>
          <ScaleFeedback style={styles.actionBtn}>
            <Ionicons
              name="share-social-outline"
              size={20}
              color={subTextClr}
            />
          </ScaleFeedback>
        </View>
        <Text style={[styles.timestamp, { color: subTextClr }]}>
          {item.timestamp}
        </Text>
      </View>
    </Animated.View>
  );
};

export default function CommunityScreen() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [activeTab, setActiveTab] = useState("All");
  const insets = useSafeAreaInsets();
  const headerHeight = insets.top + (ds.topNavBar?.height || 56);
  const bgColor = isDark
    ? ds.colors.background.dark
    : ds.colors.background.light;
  const headerColor = isDark ? ds.colors.primary.mint : "#064E3B";
  const headerSubText = isDark ? "rgba(255,255,255,0.7)" : "#3f4946";

  return (
    <View style={{ flex: 1, backgroundColor: bgColor }}>
      <FlatList
        data={POSTS_DATA}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            {/* Header Hero */}
            <View
              style={[styles.headerHero, { paddingTop: headerHeight + 24 }]}
            >
              <Text style={[styles.heroTitle, { color: headerColor }]}>
                Community
              </Text>
              <Text style={[styles.heroSub, { color: headerSubText }]}>
                See how people are improving air quality
              </Text>
            </View>

            {/* Filter Chips */}
            <View style={styles.chipsContainer}>
              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={FILTER_TABS}
                keyExtractor={(i) => i}
                contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
                renderItem={({ item }) => (
                  <FilterChip
                    label={item}
                    active={activeTab === item}
                    onPress={() => setActiveTab(item)}
                    isDark={isDark}
                  />
                )}
              />
            </View>
          </View>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        renderItem={({ item }) => <PostCard item={item} isDark={isDark} />}
        // No ItemSeparatorComponent, spacing handled in PostCard marginBottom
      />
      {/* Floating Action Button */}
      <ScaleFeedback
        style={[
          styles.fab,
          {
            backgroundColor: ds.colors.primary.mint,
            width: 60,
            height: 60,
            borderRadius: 28, // squircle-like, matches navbar
            bottom: (insets.bottom || 0) + 96, // 68(navbar)+28px
            right: 20,
            zIndex: 50,
            ...(isDark
              ? {
                  shadowColor: "transparent",
                  shadowOpacity: 0,
                  shadowRadius: 0,
                  elevation: 0,
                }
              : {
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.25,
                  shadowRadius: 8,
                  elevation: 8,
                }),
          },
        ]}
        onPress={() => console.log("Create Post")}
      >
        <Ionicons name="add" size={32} color={isDark ? "#022C22" : "#FFFFFF"} />
      </ScaleFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  headerHero: { marginBottom: 32, paddingHorizontal: 16 },
  heroTitle: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 32,
    fontWeight: "800",
    marginBottom: 8,
  },
  heroSub: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },

  chipsContainer: { marginBottom: 32, marginHorizontal: -16 },
  chip: {
    borderRadius: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chipText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    fontWeight: "600",
  },

  postCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    // marginHorizontal and marginBottom handled inline for responsiveness
    flexGrow: 1,
    minWidth: 0,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  postAuthorInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  authorName: {
    fontFamily: ds.typography.fonts.headline,
    fontSize: 16,
    fontWeight: "700",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  locationText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  tagBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  tagText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  postContent: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 16,
  },

  imageGrid: { marginBottom: 16 },
  // postImage handled inline for aspect ratio and responsiveness

  postFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
  },
  actionRow: { flexDirection: "row", gap: 24 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionText: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 14,
    fontWeight: "600",
  },

  timestamp: {
    fontFamily: ds.typography.fonts.body,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.6,
  },

  fab: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    // width, height, borderRadius, shadow, bottom, right handled inline
  },
});
