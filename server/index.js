import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET || "my_super_secret_key_123";

const app = express();
app.use(cors());
app.use(express.json());

const isProduction = process.env.DATABASE_URL?.includes("supabase");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL if we are connecting to Supabase
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

function authenticateToken(req, res, next) {
  // 1. Get the token from the headers
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer <token>

  // 2. If no token, block them
  if (!token)
    return res.status(401).json({ error: "Access denied. Please log in." });

  // 3. Verify the token is real
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token." });

    req.user = user; // Attach the user's ID to the request
    next(); // Let them pass!
  });
}

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find the user
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    // 2. Check if user exists
    if (user.rows.length === 0) {
      return res.status(400).json({ error: "User not found" });
    }

    // 3. Check password
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: "Invalid password" });
    }

    // 4. Create Token
    const token = jwt.sign({ id: user.rows[0].id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // 5. Send Response
    res.json({ token, email: user.rows[0].email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});
app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExists = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email],
    );
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email",
      [email, hashedPassword],
    );
    res.status(201).json(newUser.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

// ROUTES GO HERE
//GET
app.get("/categories", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categories");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});
//GET FOR BOOKMARKS
app.get("/bookmarks", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bookmarks.id, bookmarks.title, bookmarks.url, categories.name AS category FROM bookmarks JOIN categories ON bookmarks.category_id = categories.id WHERE bookmarks.user_id = $1

`,
      [req.user.id],
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

//POST FOR BOOKMARKS
app.post("/bookmarks",authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT into bookmarks (title, url, category_id, user_id) VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.body.title, req.body.url, req.body.category_id, req.user.id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/bookmarks/:id", authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM bookmarks WHERE id = $1 AND user_id = $2 RETURNING *`,
      [req.params.id, req.user.id],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "not found" });
    }
    res.json({ message: "deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
