import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AQI_LEVELS = [
  { max: 50, label: 'Good', color: '#34D399' },
  { max: 100, label: 'Moderate', color: '#FBBF24' },
  { max: 150, label: 'Unhealthy (SG)', color: '#FB923C' },
  { max: 200, label: 'Unhealthy', color: '#EF4444' },
  { max: 300, label: 'Very Unhealthy', color: '#A855F7' },
  { max: 500, label: 'Hazardous', color: '#991B1B' },
];

const getAQILevel = (value: number) => {
  for (const level of AQI_LEVELS) {
    if (value <= level.max) return level;
  }
  return AQI_LEVELS[AQI_LEVELS.length - 1];
};

type AQIRingProps = {
  value: number;
  maxValue?: number;
};

export default function AQIRing({ value, maxValue = 500 }: AQIRingProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const size = 200;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / maxValue, 1);

  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const level = getAQILevel(value);

  const textPrimary = isDark
    ? designSystem.designSystem.colors.primary.mint
    : designSystem.designSystem.colors.primary.lightText;
  const textSecondary = isDark ? '#94A3B8' : '#475569';
  const trackColor = isDark ? 'rgba(148, 163, 184, 0.12)' : 'rgba(0, 0, 0, 0.06)';

  // Status dots colors
  const dotColors = ['#34D399', '#FBBF24', '#FB923C', '#EF4444'];
  const activeDotIndex = value <= 50 ? 0 : value <= 100 ? 1 : value <= 150 ? 2 : 3;

  return (
    <View style={styles.container}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <LinearGradient id="aqiGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={designSystem.designSystem.colors.primary.mint} stopOpacity="1" />
            <Stop offset="1" stopColor={designSystem.designSystem.colors.primary.darkText} stopOpacity="1" />
          </LinearGradient>
        </Defs>

        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress arc */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#aqiGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.centerContent}>
        <Text style={[styles.aqiValue, { color: textPrimary }]}>{value}</Text>
        <Text style={[styles.aqiLabel, { color: textSecondary }]}>
          {level.label.toUpperCase()}
        </Text>
      </View>

      {/* Status dots */}
      <View style={styles.dotsRow}>
        {dotColors.map((color, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: color,
                opacity: i <= activeDotIndex ? 1 : 0.25,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 8,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aqiValue: {
    fontFamily: designSystem.designSystem.typography.fonts.headline,
    fontSize: 48,
    fontWeight: '700',
    letterSpacing: -1,
  },
  aqiLabel: {
    fontFamily: designSystem.designSystem.typography.fonts.body,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.5,
    marginTop: 2,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
