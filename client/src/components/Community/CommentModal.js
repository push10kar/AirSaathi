import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, ActivityIndicator, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { getComments, addComment } from '../../services/mockCommunityDB';

export default function CommentModal({ visible, onClose, post, onReportComment }) {
  const { theme, isDarkMode } = useAppTheme();
  const styles = getStyles(theme, isDarkMode);

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (visible && post) {
      loadComments();
    } else {
      setComments([]);
      setNewComment('');
    }
  }, [visible, post]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getComments(post.id);
      setComments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const added = await addComment(post.id, newComment);
      setComments([added, ...comments]); // optimistic local update
      setNewComment('');
    } catch (e) {
      console.error(e);
    } finally {
      setPosting(false);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image source={{ uri: item.user.avatar_url }} style={styles.avatar} />
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.userName}>{item.user.name}</Text>
          <TouchableOpacity 
            onPress={() => onReportComment(item)} 
            style={styles.reportBtn}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Feather name="flag" size={14} color={theme.colors.text.secondary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.commentText}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Comments</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={24} color={theme.colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.accent.primary} style={styles.loader} />
          ) : (
            <FlatList
              data={comments}
              keyExtractor={item => item.id}
              renderItem={renderComment}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={<Text style={styles.emptyText}>No comments yet. Be the first!</Text>}
            />
          )}

          {/* Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Add a comment..."
              placeholderTextColor={theme.colors.text.secondary}
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <TouchableOpacity 
              style={[styles.postBtn, !newComment.trim() && styles.postBtnDisabled]} 
              onPress={handlePostComment}
              disabled={!newComment.trim() || posting}
            >
              {posting ? (
                <ActivityIndicator size="small" color={isDarkMode ? '#000' : '#fff'} />
              ) : (
                <Feather name="send" size={18} color={newComment.trim() ? (isDarkMode ? '#000' : '#fff') : theme.colors.text.secondary} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    backgroundColor: theme.colors.background.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '80%',
    flexDirection: 'column',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.elevated,
  },
  headerTitle: {
    fontFamily: theme.fonts.headline.semiBold,
    fontSize: 18,
    color: theme.colors.text.primary,
  },
  closeBtn: {
    padding: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
  },
  emptyText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    textAlign: 'center',
    marginTop: 40,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    backgroundColor: theme.colors.background.secondary,
  },
  commentContent: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.colors.background.elevated,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontFamily: theme.fonts.body.semiBold,
    fontSize: 14,
    color: theme.colors.text.primary,
  },
  reportBtn: {
    padding: 4,
  },
  commentText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.secondary,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.background.elevated,
    backgroundColor: theme.colors.background.primary,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderWidth: 1,
    borderColor: theme.colors.background.elevated,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
    maxHeight: 100,
    fontFamily: theme.fonts.body.regular,
    fontSize: 14,
    color: theme.colors.text.primary,
    marginRight: 12,
  },
  postBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.accent.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBtnDisabled: {
    backgroundColor: theme.colors.background.secondary,
  }
});
