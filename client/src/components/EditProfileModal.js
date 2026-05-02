import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Image,
  ActivityIndicator
} from 'react-native';
import { Feather, MaterialIcons } from '@expo/vector-icons';

const AVATARS = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Midnight',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Mason',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Caleb',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Luna',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Leo',
];

export default function EditProfileModal({ visible, onClose, user, onUpdate, theme, isDarkMode }) {
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState(user?.city || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar_url || AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    setLoading(true);
    const result = await onUpdate({ name, city, avatar_url: selectedAvatar });
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.colors.background.primary }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.text.primary }]}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <MaterialIcons name="close" size={24} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.label, { color: theme.colors.text.muted }]}>SELECT AVATAR</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.avatarList}>
              {AVATARS.map((avatar, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setSelectedAvatar(avatar)}
                  style={[
                    styles.avatarWrapper, 
                    selectedAvatar === avatar && { borderColor: theme.colors.accent.primary, borderWidth: 3 }
                  ]}
                >
                  <Image source={{ uri: avatar }} style={styles.avatarImage} />
                  {selectedAvatar === avatar && (
                    <View style={[styles.checkBadge, { backgroundColor: theme.colors.accent.primary }]}>
                      <Feather name="check" size={12} color="#000" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>

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
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
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
  avatarList: {
    marginBottom: 32,
  },
  avatarWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    overflow: 'visible',
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
  },
  checkBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
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
