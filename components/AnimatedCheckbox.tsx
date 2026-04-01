/**
 * AnimatedCheckbox — shared animated checkbox component for AirSaathi.
 *
 * Animation matches the ActionCard checkbox:
 *  • Check:   spring-bounce scale 0→1 (damping 10, stiffness 260) + opacity fade-in
 *  • Uncheck: quick timing scale 1→0 + opacity fade-out
 *  • Box:     border/fill color transitions via direct prop change
 */
import React, { useEffect } from 'react';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

type AnimatedCheckboxProps = {
  checked: boolean;
  onPress: () => void;
  /** Fill + border color when checked */
  activeColor?: string;
  /** Border color when unchecked */
  borderColor?: string;
  /** Outer box size in dp */
  size?: number;
  /** Extra tap area around the box */
  hitSlop?: number;
};

export default function AnimatedCheckbox({
  checked,
  onPress,
  activeColor = '#059669',
  borderColor = '#CBD5E1',
  size = 24,
  hitSlop = 8,
}: AnimatedCheckboxProps) {
  const checkScale = useSharedValue(checked ? 1 : 0);
  const checkOpacity = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    if (checked) {
      // Spring-bounce the checkmark in
      checkScale.value = withSpring(1, { damping: 10, stiffness: 260, mass: 0.6 });
      checkOpacity.value = withTiming(1, { duration: 150 });
    } else {
      // Quick fade + shrink out
      checkScale.value = withTiming(0, { duration: 130 });
      checkOpacity.value = withTiming(0, { duration: 130 });
    }
  }, [checked]);

  const checkmarkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  const iconSize = Math.round(size * 0.54);
  const borderRadius = Math.round(size * 0.3);

  return (
    <Pressable onPress={onPress} hitSlop={hitSlop}>
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius,
          borderWidth: 2,
          borderColor: checked ? activeColor : borderColor,
          backgroundColor: checked ? activeColor : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View style={checkmarkStyle}>
          <Ionicons name="checkmark" size={iconSize} color="#FFFFFF" />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
