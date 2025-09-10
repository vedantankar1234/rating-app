const express = require("express");
const pool = require("../db");
const router = express.Router();

// 🔹 Get all stores with average ratings
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, COALESCE(AVG(r.rating),0) AS average_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      GROUP BY s.id
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Add new store
router.post("/", async (req, res) => {
  const { name, address, owner_email } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO stores (name, address, owner_email) VALUES ($1,$2,$3) RETURNING *",
      [name, address, owner_email]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
