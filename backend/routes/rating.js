const express = require("express");
const pool = require("../db");
const router = express.Router();

// 🔹 Submit or update a rating
router.post("/", async (req, res) => {
  const { storeId, userEmail, rating } = req.body;
  try {
    // Check if rating already exists
    const existing = await pool.query(
      "SELECT * FROM ratings WHERE store_id=$1 AND user_email=$2",
      [storeId, userEmail]
    );

    if (existing.rows.length > 0) {
      // Update existing rating
      await pool.query(
        "UPDATE ratings SET rating=$1 WHERE store_id=$2 AND user_email=$3",
        [rating, storeId, userEmail]
      );
    } else {
      // Insert new rating
      await pool.query(
        "INSERT INTO ratings (store_id, user_email, rating) VALUES ($1,$2,$3)",
        [storeId, userEmail, rating]
      );
    }

    res.json({ message: "Rating saved" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
