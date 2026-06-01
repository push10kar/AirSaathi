import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  ActivityIndicator,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';


const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function EditProfileModal({ visible, onClose, user, onUpdate, theme, isDarkMode }) {
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const sheetTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
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

  useEffect(() => {
    setName(user?.name || '');
    setCity(user?.city || '');
    setSelectedAvatar(user?.avatar_url || null);
  }, [user]);

  const handleClose = () => {
    Keyboard.dismiss();
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

  const handleImagePick = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setSelectedAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    const result = await onUpdate({ name, city, avatar_url: selectedAvatar });
    if (result.success) {
      handleClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

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
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Edit Profile</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.label, { color: theme.colors.text.muted }]}>PROFILE PICTURE</Text>
            <View style={styles.avatarOptionsRow}>
              <View style={styles.currentAvatarContainer}>
                {selectedAvatar ? (
                  <Image source={{ uri: selectedAvatar }} style={styles.avatarPreview} />
                ) : (
                  <View style={[styles.avatarPreview, styles.avatarPlaceholder]}>
                    <Feather name="user" size={32} color={theme.colors.text.muted} />
                  </View>
                )}
              </View>
              
              <View style={styles.avatarActionBtns}>
                <TouchableOpacity 
                  style={[styles.avatarActionBtn, { backgroundColor: theme.colors.background.secondary }]} 
                  onPress={handleImagePick}
                >
                  <Feather name="image" size={18} color={theme.colors.accent.primary} />
                  <Text style={[styles.avatarActionText, { color: theme.colors.text.primary }]}>Change Profile</Text>
                </TouchableOpacity>
                
                {(selectedAvatar || user?.avatar_url) && (
                  <TouchableOpacity 
                    style={[styles.avatarActionBtn, { backgroundColor: 'rgba(255, 75, 75, 0.12)' }]} 
                    onPress={() => setSelectedAvatar(null)}
                  >
                    <Feather name="trash-2" size={18} color="#FF3B30" />
                    <Text style={[styles.avatarActionText, { color: "#FF3B30" }]}>Remove Profile</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <Text style={[styles.label, { color: theme.colors.text.muted }]}>NAME</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
              <Feather name="user" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                value={name}
                onChangeText={setName}
                placeholder="Your Name"
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>

            <Text style={[styles.label, { color: theme.colors.text.muted }]}>CITY</Text>
            <View style={[styles.inputContainer, { backgroundColor: theme.colors.background.secondary, borderColor: theme.colors.background.elevated }]}>
              <Feather name="map-pin" size={20} color={theme.colors.text.muted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: theme.colors.text.primary }]}
                value={city}
                onChangeText={setCity}
                placeholder="Your City"
                placeholderTextColor={theme.colors.text.muted}
              />
            </View>

            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: theme.colors.accent.primary }, loading && { opacity: 0.7 }]} 
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={isDarkMode ? '#000' : '#fff'} />
              ) : (
                <Text style={[styles.saveBtnText, { color: isDarkMode ? '#000' : '#fff' }]}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContainer: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    height: '80%',
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'SpaceGrotesk_700Bold',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  avatarOptionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 20,
  },
  currentAvatarContainer: {
    position: 'relative',
  },
  avatarPreview: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.2)',
  },
  avatarActionBtns: {
    flex: 1,
    gap: 10,
  },
  avatarActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 10,
  },
  avatarActionText: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 16,
    marginBottom: 24,
    width: '100%',
    height: 56,
    borderWidth: 1,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter_400Regular',
  },
  errorText: {
    color: '#FF4B4B',
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveBtn: {
    width: '100%',
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  saveBtnText: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
  }
});
