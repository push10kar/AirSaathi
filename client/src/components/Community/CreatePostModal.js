import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { createPost } from '../../services/mockCommunityDB';

export default function CreatePostModal({ visible, onClose, onPostCreated }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);

  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('action');
  const [tagsInput, setTagsInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mediaSelected, setMediaSelected] = useState(null); // mock media {type, url}

  const handleAddMedia = (type) => {
    setMediaSelected({
      type,
      url: type === 'video' 
        ? 'https://images.unsplash.com/photo-1509391366360-1f95091eb649?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' // Using an image poster for mock video
        : 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    });
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsLoading(true);

    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);

    try {
      const newPost = await createPost({
        content,
        post_type: postType,
        tags,
        media_url: mediaSelected ? mediaSelected.url : null,
        media_type: mediaSelected ? mediaSelected.type : null,
      });
      onPostCreated(newPost);
      // Reset form
      setContent('');
      setPostType('action');
      setTagsInput('');
      setMediaSelected(null);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} disabled={isLoading} style={styles.closeBtn}>
            <Feather name="x" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            style={[styles.postBtn, !content.trim() && styles.postBtnDisabled]} 
            onPress={handlePost}
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.postBtnText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.contentContainer}>
          {/* Input Area */}
          <TextInput
            style={styles.textInput}
            placeholder="What do you want to share with the community?"
            placeholderTextColor={theme.colors.text.secondary}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            editable={!isLoading}
          />

          {/* Type Selector */}
          <Text style={styles.sectionTitle}>Post Type</Text>
          <View style={styles.typeSelectorRow}>
            {['action', 'complaint', 'achievement'].map(type => (
              <TouchableOpacity 
                key={type}
                style={[
                  styles.typeChip, 
                  postType === type && styles.typeChipActive,
                  postType === type && { backgroundColor: getTypeColor(type, theme) + '20', borderColor: getTypeColor(type, theme) }
                ]}
                onPress={() => setPostType(type)}
                disabled={isLoading}
              >
                <Text style={[
                  styles.typeChipText,
                  postType === type && { color: getTypeColor(type, theme) }
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Tags */}
          <Text style={styles.sectionTitle}>Tags (comma separated)</Text>
          <TextInput
            style={styles.tagInput}
            placeholder="e.g. garbage, plantation, water"
            placeholderTextColor={theme.colors.text.secondary}
            value={tagsInput}
            onChangeText={setTagsInput}
            editable={!isLoading}
          />

          {/* Media Attachments */}
          <View style={styles.mediaActionsRow}>
            <TouchableOpacity style={styles.mediaBtn} disabled={isLoading} onPress={() => handleAddMedia('image')}>
              <Feather name="image" size={20} color={theme.colors.accent.primary} />
              <Text style={styles.mediaBtnText}>Image</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mediaBtn} disabled={isLoading} onPress={() => handleAddMedia('video')}>
              <Feather name="video" size={20} color={theme.colors.accent.primary} />
              <Text style={styles.mediaBtnText}>Video</Text>
            </TouchableOpacity>
          </View>

          {mediaSelected && (
            <View style={styles.mediaPreview}>
              <View style={styles.mediaPreviewIcon}>
                <Feather name={mediaSelected.type === 'video' ? 'video' : 'image'} size={24} color={theme.colors.accent.primary} />
              </View>
              <Text style={styles.mediaPreviewText}>Mock {mediaSelected.type} attached</Text>
              <TouchableOpacity onPress={() => setMediaSelected(null)}>
                <Feather name="x-circle" size={20} color={theme.colors.support.error} />
              </TouchableOpacity>
            </View>
          )}
          
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getTypeColor = (type, theme) => {
  switch(type) {
    case 'complaint': return theme.colors.support.error;
    case 'achievement': return theme.colors.accent.primary;
    case 'action': return theme.colors.support.teal;
    default: return theme.colors.text.secondary;
  }
};

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.elevated,
  },
  closeBtn: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontFamily: theme.fonts.headline.semiBold,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  postBtn: {
    backgroundColor: theme.colors.accent.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 64,
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: theme.colors.background.secondary,
  },
  postBtnText: {
    color: isDarkMode ? '#000' : '#fff',
    fontFamily: theme.fonts.label.bold,
    fontSize: 14,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  textInput: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 18,
    color: theme.colors.text.primary,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sectionTitle: {
    fontFamily: theme.fonts.label.semiBold,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginTop: 24,
    marginBottom: 12,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary,
    marginRight: 12,
    marginBottom: 8,
  },
  typeChipActive: {
    borderWidth: 2,
  },
  typeChipText: {
    fontFamily: theme.fonts.label.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
  },
  tagInput: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.primary,
    borderWidth: 1,
    borderColor: theme.colors.background.elevated,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.colors.background.primary,
  },
  mediaActionsRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  mediaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.colors.background.elevated,
    marginRight: 12,
  },
  mediaBtnText: {
    fontFamily: theme.fonts.label.semiBold,
    fontSize: 14,
    color: theme.colors.accent.primary,
    marginLeft: 8,
  },
  mediaPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.secondary,
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: theme.colors.text.secondary + '40',
  },
  mediaPreviewIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.background.elevated,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  mediaPreviewText: {
    flex: 1,
    fontFamily: theme.fonts.body.medium,
    fontSize: 14,
    color: theme.colors.text.primary,
  }
});
