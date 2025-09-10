const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET all users
router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, email, role FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Users error:",err.message);
    res.status(500).json({ message:"Server error"});
  }
});

// Register new user
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, email, password, role]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

// LOGIN route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];
    res.json({ user });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get statistics (counts of users, stores, ratings)
router.get("/stats", async (req, res) => {
  try {
    const usersCount = await pool.query("SELECT COUNT(*) FROM users");
    const storesCount = await pool.query("SELECT COUNT(*) FROM stores");
    const ratingsCount = await pool.query("SELECT COUNT(*) FROM ratings");

    res.json({
      totalUsers: usersCount.rows[0].count,
      totalStores: storesCount.rows[0].count,
      totalRatings: ratingsCount.rows[0].count,
    });
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all stores
router.get("/stores", async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, address, owner_id FROM stores");
    res.json(result.rows);
  } catch (err) {
    console.error("Stores error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all ratings
router.get("/ratings", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM ratings");
    res.json(result.rows);
  } catch (err) {
    console.error("Ratings error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Add new rating (Normal User)
router.post("/ratings", async (req, res) => {
  try {
    const { user_id, store_id, rating } = req.body;
    console.log("Incoming rating data:", req.body);

    if (!user_id || !store_id || !rating) {
      return res.status(400).json({ message: "user_id, store_id and rating are required" });
    }

    // check if rating already exists (update instead of duplicate)
    const existing = await pool.query(
      "SELECT * FROM ratings WHERE user_id = $1 AND store_id = $2",
      [user_id, store_id]
    );

    if (existing.rows.length > 0) {
      // update rating
      const updated = await pool.query(
        "UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3 RETURNING *",
        [rating, user_id, store_id]
      );
      return res.json(updated.rows[0]);
    }

    // insert new rating
    const result = await pool.query(
      "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3) RETURNING *",
      [user_id, store_id, rating]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Add rating error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

// Create store (Admin)
router.post("/stores", async (req, res) => {
  const { name, address, owner_id } = req.body;
  if (!name || !address || !owner_id) {
    return res.status(400).json({ message: "name, address and owner_id are required" });
  }

  try {
    // check owner exists and has role 'owner'
    const owner = await pool.query("SELECT id, role FROM users WHERE id = $1", [owner_id]);
    if (owner.rows.length === 0) {
      return res.status(400).json({ message: "Owner not found" });
    }
    if (owner.rows[0].role !== "owner") {
      return res.status(400).json({ message: "Selected user is not a store owner" });
    }

    const result = await pool.query(
      "INSERT INTO stores (name, address, owner_id) VALUES ($1, $2, $3) RETURNING *",
      [name, address, owner_id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Create store error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Submit rating
router.post("/ratings", async (req, res) => {
  try {
    const { user_id, store_id, rating } = req.body;

    if (!user_id || !store_id || !rating) {
      return res.status(400).json({ message: "user_id, store_id and rating are required" });
    }

    // Insert or update rating if user already rated the store
    const result = await pool.query(
      `INSERT INTO ratings (user_id, store_id, rating)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, store_id) DO UPDATE
       SET rating = EXCLUDED.rating
       RETURNING *`,
      [user_id, store_id, rating]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Submit rating error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;