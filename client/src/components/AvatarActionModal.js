import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AvatarActionModal({ visible, onClose, onChange, onRemove, hasAvatar, theme }) {
  const backdropOpacity = React.useRef(new Animated.Value(0)).current;
  const sheetTranslateY = React.useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(sheetTranslateY, {
          toValue: 0,
          tension: 45,
          friction: 12,
          useNativeDriver: true,
        })
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(sheetTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        </Animated.View>

        <Animated.View style={[
          styles.modalContainer, 
          { 
            backgroundColor: theme.colors.background.primary,
            transform: [{ translateY: sheetTranslateY }]
          }
        ]}>
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>
            {hasAvatar ? 'Profile Picture' : 'Add Photo'}
          </Text>
              
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={[styles.optionBtn, { backgroundColor: theme.colors.background.secondary }]} 
                  onPress={onChange}
                >
                  <View style={[styles.iconBox, { backgroundColor: theme.colors.accent.primary + '20' }]}>
                    <Feather name="image" size={20} color={theme.colors.accent.primary} />
                  </View>
                  <Text style={[styles.optionText, { color: theme.colors.text.primary }]}>
                    {hasAvatar ? 'Change Profile' : 'Choose from Gallery'}
                  </Text>
                </TouchableOpacity>

                {hasAvatar && (
                  <TouchableOpacity 
                    style={[styles.optionBtn, { backgroundColor: 'rgba(255, 75, 75, 0.1)' }]} 
                    onPress={onRemove}
                  >
                    <View style={[styles.iconBox, { backgroundColor: 'rgba(255, 75, 75, 0.1)' }]}>
                      <Feather name="trash-2" size={20} color="#FF4B4B" />
                    </View>
                    <Text style={[styles.optionText, { color: '#FF4B4B' }]}>Remove Profile</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity 
                  style={[styles.cancelBtn, { borderColor: theme.colors.background.elevated }]} 
                  onPress={handleClose}
                >
                  <Text style={[styles.cancelText, { color: theme.colors.text.muted }]}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: '100%',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 16,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 16,
    flex: 1,
  },
  cancelBtn: {
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
  },
  cancelText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 15,
  }
});
