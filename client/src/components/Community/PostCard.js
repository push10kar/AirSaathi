import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { toggleLike } from '../../services/mockCommunityDB';

export default function PostCard({ post, onOptionsPress, onCommentPress }) {
  const { theme, isDarkMode } = useAppTheme();
  const { requireAuth } = useAuth();
  const styles = getStyles(theme, isDarkMode);

  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);

  // Parse time ago
  const getTimeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins < 60) return `${diffMins} mins ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs} hrs ago`;
    return `${Math.floor(diffHrs / 24)} days ago`;
  };

  const handleLike = async () => {
    // Optimistic update
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    try {
      await toggleLike(post.id);
    } catch (e) {
      // Revert if error
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    }
  };

  const getBadgeStyles = (type) => {
    const isDark = isDarkMode;
    switch(type) {
      case 'achievement':
        return {
          bg: isDark ? 'rgba(196, 255, 1, 0.15)' : '#D1FAE5', // Light Green
          text: isDark ? theme.colors.accent.primary : '#065F46', // Dark Green
        };
      case 'complaint':
        return {
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#FEE2E2', // Light Red
          text: isDark ? '#FCA5A5' : '#991B1B', // Dark Red
        };
      case 'action':
        return {
          bg: isDark ? 'rgba(45, 212, 191, 0.15)' : '#CCFBF1', // Light Teal
          text: isDark ? '#5EEAD4' : '#115E59', // Dark Teal
        };
      default:
        return {
          bg: theme.colors.background.elevated,
          text: theme.colors.text.secondary,
        };
    }
  };

  const badgeStyle = getBadgeStyles(post.post_type);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <Image source={{ uri: post.user.avatar_url }} style={styles.avatar} />
          <View>
            <Text style={styles.userName}>{post.user.name}</Text>
            <Text style={styles.timeText}>{getTimeAgo(post.created_at)} • {post.user.city}</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => onOptionsPress(post)} 
          style={styles.optionsBtn}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        >
          <Feather name="flag" size={18} color={theme.colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Tags Badge */}
      <View style={styles.tagRow}>
        <View style={[styles.typeBadge, { backgroundColor: badgeStyle.bg }]}>
          <Text style={[styles.typeBadgeText, { color: badgeStyle.text }]}>
            {post.post_type.toUpperCase()}
          </Text>
        </View>
        {post.tags.map(tag => (
          <Text key={tag} style={styles.hashTag}>#{tag}</Text>
        ))}
      </View>

      {/* Content */}
      <Text style={styles.content}>
        {post.content}
      </Text>

      {/* Optional Media */}
      {post.media_url && (
        <View style={styles.mediaContainer}>
          <Image source={{ uri: post.media_url }} style={styles.media} resizeMode="cover" />
          {post.media_type === 'video' && (
            <View style={styles.videoOverlay}>
              <View style={styles.playButton}>
                <Feather name="play" size={24} color="#fff" style={{ marginLeft: 4 }} />
              </View>
            </View>
          )}
        </View>
      )}

      {/* Engagement */}
      <View style={styles.engagementRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => requireAuth(handleLike)}>
          <Feather name="thumbs-up" size={18} color={isLiked ? theme.colors.accent.primary : theme.colors.text.secondary} />
          <Text style={[styles.actionText, isLiked && { color: theme.colors.accent.primary }]}>{likesCount}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.actionBtn} onPress={() => requireAuth(() => onCommentPress(post))}>
          <Feather name="message-square" size={18} color={theme.colors.text.secondary} />
          <Text style={styles.actionText}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn}>
          <Feather name="share-2" size={18} color={theme.colors.text.secondary} />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (theme, isDarkMode) => StyleSheet.create({
  card: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: 24,
    padding: 24,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: theme.colors.background.secondary,
  },
  userName: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 15,
    color: theme.colors.text.primary,
  },
  timeText: {
    fontFamily: theme.fonts.body.regular,
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  optionsBtn: {
    padding: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 10,
  },
  typeBadgeText: {
    fontFamily: theme.fonts.headline.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  hashTag: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 13,
    color: theme.colors.accent.primary,
    marginRight: 8,
  },
  content: {
    fontFamily: theme.fonts.headline.medium,
    fontSize: 16,
    color: theme.colors.text.primary,
    lineHeight: 24,
    marginBottom: 16,
  },
  mediaContainer: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: theme.colors.background.secondary,
    overflow: 'hidden',
    position: 'relative',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  engagementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  actionText: {
    fontFamily: theme.fonts.body.medium,
    fontSize: 14,
    color: theme.colors.text.secondary,
    marginLeft: 6,
  }
});
