import express from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const isProduction = process.env.DATABASE_URL?.includes("supabase");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  // Only use SSL if we are connecting to Supabase
  ssl: isProduction ? { rejectUnauthorized: false } : false,
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
app.get("/bookmarks", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT bookmarks.id, bookmarks.title, bookmarks.url, categories.name AS category FROM bookmarks JOIN categories ON bookmarks.category_id = categories.id`,
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

//POST FOR BOOKMARKS
app.post("/bookmarks", async (req, res) => {
  try {
    const result = await pool.query(
      `INSERT into bookmarks (title, url, category_id) VALUES ($1, $2, $3) RETURNING *`,
      [req.body.title, req.body.url, req.body.category_id],
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

app.delete("/bookmarks/:id", async (req, res) => {
  try {
    const result = await pool.query(
      `DELETE FROM bookmarks WHERE id = $1 RETURNING *`,
      [req.params.id],
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