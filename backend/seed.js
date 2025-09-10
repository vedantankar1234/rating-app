const pool = require("./db");

async function seed() {
  try {
    // 🔹 Clear old data
    await pool.query("DELETE FROM ratings");
    await pool.query("DELETE FROM stores");
    await pool.query("DELETE FROM users");

    // 🔹 Insert Admin user
    await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1,$2,$3,$4,$5)",
      ["System Admin", "admin@example.com", "Admin@123", "HQ Address", "ADMIN"]
    );

    // 🔹 Insert Normal User
    await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1,$2,$3,$4,$5)",
      ["Normal User", "user@example.com", "User@1234", "User Address", "USER"]
    );

    // 🔹 Insert Store Owner
    await pool.query(
      "INSERT INTO users (name, email, password, address, role) VALUES ($1,$2,$3,$4,$5)",
      ["Store Owner", "owner@example.com", "Owner@123", "Owner Address", "OWNER"]
    );

    // 🔹 Insert Store
    await pool.query(
      "INSERT INTO stores (name, address, owner_email) VALUES ($1,$2,$3)",
      ["Test Store", "123 Main St", "owner@example.com"]
    );

    console.log("✅ Seeding complete!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
