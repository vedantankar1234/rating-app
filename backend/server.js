require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");
const storeRoutes = require("./routes/store");
const ratingRoutes = require("./routes/rating");

const pool = require("./db");  
const app =express();
app.use(cors())
app.use(bodyParser.json())
pool.connect()
  .then(client => {
    client.release();
    console.log("✅ PostgreSQL connected successfully");
  })
  .catch(err => console.error("❌ PostgreSQL connection error:", err));

// Routes
app.use("/auth", authRoutes);
app.use("/stores", storeRoutes);
app.use("/ratings", ratingRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(5000, () => console.log("✅ Backend running at http://localhost:5000"));
