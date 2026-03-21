import { View, Text, StyleSheet } from 'react-native';
import designSystem from '../../context/design_system.json';

export default function LearnScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Learn View</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: designSystem.colors.background.dark,
    paddingHorizontal: designSystem.spacing.screen.horizontal,
    paddingVertical: designSystem.spacing.screen.vertical,
  },
  title: {
    fontFamily: designSystem.typography.scale.h1.fontFamily,
    fontSize: designSystem.typography.scale.h1.fontSize,
    fontWeight: designSystem.typography.scale.h1.fontWeight as any,
    color: designSystem.colors.text.dark.primary,
  }
});
