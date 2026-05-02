const pool = require('../config/db');
const { z } = require('zod');

// Validation schemas
const postSchema = z.object({
  content: z.string().min(1).max(2000),
  media_url: z.string().url().optional().or(z.literal('')),
  media_type: z.enum(['image', 'video', 'none']).default('none'),
  post_type: z.enum(['achievement', 'complaint', 'action', 'other']).optional(),
  location: z.string().max(200).optional(),
  tags: z.array(z.string()).optional()
});

const postController = {
  // GET /api/posts
  getFeed: async (req, res, next) => {
    try {
      const { post_type, tag } = req.query;
      
      let query = `
        SELECT 
          p.*,
          u.name as user_name,
          u.avatar_url as user_avatar,
          u.city as user_city,
          (SELECT COUNT(*) FROM post_likes WHERE post_id = p.id) as likes_count,
          (SELECT COUNT(*) FROM comments WHERE post_id = p.id) as comments_count,
          ${req.user ? 'EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.id AND user_id = $1)' : 'FALSE'} as is_liked,
          COALESCE(
            (SELECT json_agg(t.name) 
             FROM post_tags t 
             JOIN post_tag_map m ON t.id = m.tag_id 
             WHERE m.post_id = p.id), 
            '[]'
          ) as tags
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.is_hidden = false AND p.is_deleted = false
      `;

      const params = req.user ? [req.user.id] : [];
      let paramCount = params.length;

      if (post_type && post_type !== 'All') {
        paramCount++;
        query += ` AND p.post_type = $${paramCount}`;
        params.push(post_type.toLowerCase());
      }

      query += ` ORDER BY p.created_at DESC LIMIT 50`;

      const result = await pool.query(query, params);
      res.json(result.rows);
    } catch (err) {
      next(err);
    }
  },

  // POST /api/posts
  createPost: async (req, res, next) => {
    const client = await pool.connect();
    try {
      const validatedData = postSchema.parse(req.body);
      const { content, media_url, media_type, post_type, location, tags } = validatedData;

      await client.query('BEGIN');

      const postResult = await client.query(
        `INSERT INTO posts (user_id, content, media_url, media_type, post_type, location)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [req.user.id, content, media_url, media_type, post_type, location]
      );

      const post = postResult.rows[0];

      // Handle tags
      if (tags && tags.length > 0) {
        for (const tagName of tags) {
          // Insert tag if not exists
          const tagResult = await client.query(
            'INSERT INTO post_tags (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name RETURNING id',
            [tagName.toLowerCase()]
          );
          const tagId = tagResult.rows[0].id;
          
          // Map tag to post
          await client.query(
            'INSERT INTO post_tag_map (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [post.id, tagId]
          );
        }
      }

      await client.query('COMMIT');
      res.status(201).json(post);
    } catch (err) {
      await client.query('ROLLBACK');
      next(err);
    } finally {
      client.release();
    }
  },

  // POST /api/posts/:id/like
  toggleLike: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Check if already liked
      const checkLike = await pool.query(
        'SELECT id FROM post_likes WHERE post_id = $1 AND user_id = $2',
        [id, userId]
      );

      if (checkLike.rows.length > 0) {
        // Unlike
        await pool.query(
          'DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2',
          [id, userId]
        );
        res.json({ liked: false });
      } else {
        // Like
        await pool.query(
          'INSERT INTO post_likes (post_id, user_id) VALUES ($1, $2)',
          [id, userId]
        );
        res.json({ liked: true });
      }
    } catch (err) {
      next(err);
    }
  }
};

module.exports = postController;
