const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { protect, optionalAuth } = require('../middleware/auth');

/**
 * STRATEGY IMPLEMENTATION:
 * Explore Screens (Feed, Comments) use optionalAuth.
 * Action Screens (Create, Like, Comment) use protect.
 */

// Feed - READ ONLY (Optional Auth)
router.get('/', optionalAuth, postController.getFeed);

// Create Post - ACTION (Required Auth)
router.post('/', protect, postController.createPost);

// Like - INTERACT (Required Auth)
router.post('/:id/like', protect, postController.toggleLike);

// Nested comment routes
// Read comments (Optional)
router.get('/:postId/comments', optionalAuth, commentController.getComments);
// Create comment (Required)
router.post('/:postId/comments', protect, commentController.createComment);

module.exports = router;
