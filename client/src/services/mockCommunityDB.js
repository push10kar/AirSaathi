// mockCommunityDB.js

let users = [
  { id: '1', name: 'Jackie Jones', avatar_url: 'https://i.pravatar.cc/150?u=1', city: 'Pune' },
  { id: '2', name: 'Darrell Steward', avatar_url: 'https://i.pravatar.cc/150?u=2', city: 'Pune' },
  { id: '3', name: 'Jane Doe', avatar_url: 'https://i.pravatar.cc/150?u=3', city: 'Mumbai' },
  { id: '4', name: 'Me', avatar_url: 'https://i.pravatar.cc/150?u=me', city: 'Pune' }, // Current user
];

let posts = [
  {
    id: '101',
    user_id: '1',
    content: 'Our neighborhood just completed a huge tree plantation drive! We planted over 50 saplings near the park. Great effort by everyone involved. 🌱',
    media_url: null,
    media_type: null,
    post_type: 'achievement',
    created_at: new Date(Date.now() - 30 * 60000).toISOString(), // 30 mins ago
  },
  {
    id: '102',
    user_id: '2',
    content: 'Huge garbage pile accumulating near the local stadium. Hasn\'t been cleared for a week. Needs immediate attention!',
    media_url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    media_type: 'image',
    post_type: 'complaint',
    created_at: new Date(Date.now() - 45 * 60000).toISOString(), // 45 mins ago
  },
  {
    id: '103',
    user_id: '3',
    content: 'Join us this Sunday for the beach cleanup drive! We will provide gloves and bags.',
    media_url: null,
    media_type: null,
    post_type: 'action',
    created_at: new Date(Date.now() - 120 * 60000).toISOString(), // 2 hours ago
  },
  {
    id: '104',
    user_id: '1',
    content: 'Check out this quick video of our new solar water heater installation! ☀️💧',
    media_url: 'https://images.unsplash.com/photo-1509391366360-1f95091eb649?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    media_type: 'video',
    post_type: 'achievement',
    created_at: new Date(Date.now() - 180 * 60000).toISOString(), // 3 hours ago
  }
];

let post_tags = [
  { id: 't1', name: 'plantation' },
  { id: 't2', name: 'garbage' },
  { id: 't3', name: 'cleanup' },
  { id: 't4', name: 'burning' }
];

let post_tag_map = [
  { post_id: '101', tag_id: 't1' },
  { post_id: '102', tag_id: 't2' },
  { post_id: '103', tag_id: 't3' }
];

let comments = [
  { id: 'c1', post_id: '101', user_id: '2', content: 'Awesome work!', created_at: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'c2', post_id: '102', user_id: '1', content: 'I reported this on the municipal app too.', created_at: new Date(Date.now() - 10 * 60000).toISOString() }
];

let post_likes = [
  { user_id: '2', post_id: '101' },
  { user_id: '3', post_id: '101' },
  { user_id: '1', post_id: '103' },
];

let reports = [];

// Helper to delay simulation
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getFeed = async (filters = {}) => {
  await delay(500); // simulate network

  let filteredPosts = [...posts];

  if (filters.post_type && filters.post_type !== 'All') {
    const typeMap = { 'Actions': 'action', 'Complaints': 'complaint', 'Achievements': 'achievement' };
    const mappedType = typeMap[filters.post_type];
    if (mappedType) {
      filteredPosts = filteredPosts.filter(p => p.post_type === mappedType);
    }
  }

  // Hydrate posts
  const feed = filteredPosts.map(post => {
    const user = users.find(u => u.id === post.user_id);
    const likesCount = post_likes.filter(l => l.post_id === post.id).length;
    const commentsCount = comments.filter(c => c.post_id === post.id).length;
    const isLiked = post_likes.some(l => l.post_id === post.id && l.user_id === '4'); // assuming '4' is current user
    
    // Get tags
    const tagIds = post_tag_map.filter(ptm => ptm.post_id === post.id).map(ptm => ptm.tag_id);
    const tags = post_tags.filter(t => tagIds.includes(t.id)).map(t => t.name);

    return {
      ...post,
      user,
      likesCount,
      commentsCount,
      isLiked,
      tags
    };
  });

  // Sort by recent first (in a real app might consider likes too)
  return feed.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const createPost = async (postData) => {
  await delay(800);
  const newPostId = Date.now().toString();
  const newPost = {
    id: newPostId,
    user_id: '4', // current user
    content: postData.content,
    media_url: postData.media_url || null,
    media_type: postData.media_type || null,
    post_type: postData.post_type,
    created_at: new Date().toISOString()
  };
  posts.unshift(newPost); // push to top

  if (postData.tags && postData.tags.length > 0) {
    postData.tags.forEach(tagName => {
      let tag = post_tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
      if (!tag) {
        tag = { id: `t${Date.now()}-${Math.random()}`, name: tagName.toLowerCase() };
        post_tags.push(tag);
      }
      post_tag_map.push({ post_id: newPostId, tag_id: tag.id });
    });
  }
  return newPost;
};

export const toggleLike = async (postId) => {
  // instant optimistic response usually in UI, here we just update store
  const existingIdx = post_likes.findIndex(l => l.post_id === postId && l.user_id === '4');
  if (existingIdx >= 0) {
    post_likes.splice(existingIdx, 1);
    return { liked: false };
  } else {
    post_likes.push({ user_id: '4', post_id: postId });
    return { liked: true };
  }
};

export const getComments = async (postId) => {
  await delay(300);
  const postComments = comments.filter(c => c.post_id === postId);
  return postComments.map(comment => {
    const user = users.find(u => u.id === comment.user_id);
    return { ...comment, user };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
};

export const addComment = async (postId, content) => {
  await delay(500);
  const newComment = {
    id: Date.now().toString(),
    post_id: postId,
    user_id: '4', // current user
    content,
    created_at: new Date().toISOString()
  };
  comments.push(newComment);
  const user = users.find(u => u.id === '4');
  return { ...newComment, user };
};

export const reportContent = async (targetType, targetId, reason, details) => {
  await delay(600);
  const newReport = {
    id: Date.now().toString(),
    reporter_id: '4', // current user
    target_type: targetType, // 'post' or 'comment'
    target_id: targetId,
    reason,
    details,
    status: 'pending',
    created_at: new Date().toISOString()
  };
  reports.push(newReport);
  return newReport;
};

export const getGroups = async () => {
  await delay(200);
  return [
    { id: 'g1', name: 'Clean Pune', image: 'https://images.unsplash.com/photo-1523315482315-99882987178c?auto=format&fit=crop&w=150&q=80' },
    { id: 'g2', name: 'Tree Lovers', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=150&q=80' },
    { id: 'g3', name: 'Zero Waste', image: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?auto=format&fit=crop&w=150&q=80' },
    { id: 'g4', name: 'Save Water', image: 'https://images.unsplash.com/photo-1541888062961-396a51d0aa37?auto=format&fit=crop&w=150&q=80' },
    { id: 'g5', name: 'Local Paws', image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=150&q=80' },
    { id: 'g6', name: 'Cyclists', image: 'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?auto=format&fit=crop&w=150&q=80' },
  ];
}
