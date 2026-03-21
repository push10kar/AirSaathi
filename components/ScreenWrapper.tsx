import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import topNavConfig from '../context/topNav.json';
import designSystem from '../context/design_system.json';
import { useTheme } from '../context/ThemeContext';

export default function ScreenWrapper({ children, style, contentContainerStyle }: any) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const headerHeight = insets.top + topNavConfig.topNavBar.height;
  const bgColor = isDark ? designSystem.designSystem.colors.background.dark : designSystem.designSystem.colors.background.light;

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: bgColor }, style]}
      contentContainerStyle={[
        { 
          paddingTop: headerHeight + 24, 
          paddingBottom: 140, // Enough clearance for the Squircle NavBar
          paddingHorizontal: 16 
        }, 
        contentContainerStyle
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
