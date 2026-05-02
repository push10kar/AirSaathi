const pool = require('../config/db');
const { z } = require('zod');

const commentSchema = z.object({
  content: z.string().min(1).max(1000)
});

const commentController = {
  // GET /api/posts/:postId/comments
  getComments: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const query = `
        SELECT 
          c.*,
          u.name as user_name,
          u.avatar_url as user_avatar
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1 AND c.is_hidden = false AND c.is_deleted = false
        ORDER BY c.created_at ASC
      `;
      const result = await pool.query(query, [postId]);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/posts/:postId/comments
  createComment: async (req, res, next) => {
    try {
      const { postId } = req.params;
      const { content } = commentSchema.parse(req.body);
      
      const result = await pool.query(
        `INSERT INTO comments (post_id, user_id, content)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [postId, req.user.id, content]
      );
      
      res.status(201).json(result.rows[0]);
    } catch (err) {
      next(err);
    }
  }
};

module.exports = commentController;
