const pool = require('../config/db');

exports.createReport = async (req, res) => {
  try {
    const { type, message } = req.body;
    const userId = req.user ? req.user.id : null;

    if (!type || !message) {
      return res.status(400).json({ error: 'Type and message are required' });
    }

    const query = `
      INSERT INTO app_feedback (user_id, type, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    
    const result = await pool.query(query, [userId, type, message]);

    res.status(201).json({
      message: 'Report submitted successfully',
      report: result.rows[0]
    });
  } catch (error) {
    console.error('Report submission error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getReports = async (req, res) => {
  try {
    // Only admin should be able to see all reports (simplifying for now)
    const result = await pool.query('SELECT * FROM app_feedback ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
