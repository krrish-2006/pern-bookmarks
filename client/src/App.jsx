import { useState, useEffect } from "react";
import BookmarkCard from "./components/BookmarkCard";
import BookmarkForm from "./components/BookmarkForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category_id, setCategory_id] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetchBookmarks();
    fetchCategories();
  }, []);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bookmarks`);
      if (!res.ok) throw new Error("Failed to fetch bookmarks");
      const data = await res.json();
      setBookmarks(data);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) throw new Error("Failed to fetch categories");
      const data = await res.json();
      setCategories(data);
    } catch (err) {
      setError(err.message);
    }
  }

  async function addBookmark(e) {
    e.preventDefault();
    if (!title || !url || !category_id){
      alert("Please fill in all fields before adding a bookmark.");
      return;
    }
    if (!url.includes(".")){
      alert("Please enter a valid website URL (e.g., google.com).");
      return;
    }
      try {
        const res = await fetch(`${API_URL}/bookmarks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, url, category_id }),
        });
        if (!res.ok) throw new Error("Failed to add bookmark");
        const newBookmark = await res.json();
        setBookmarks([...bookmarks, newBookmark]);
        setTitle("");
        setUrl("");
        setCategory_id("");
      } catch (err) {
        setError(err.message);
      }
  }

  async function deleteBookmark(id) {
    try {
      const res = await fetch(`${API_URL}/bookmarks/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      {/* Replace the giant form with this! */}
      <BookmarkForm
        title={title}
        setTitle={setTitle}
        url={url}
        setUrl={setUrl}
        category_id={category_id}
        setCategory_id={setCategory_id}
        categories={categories}
        onSubmit={addBookmark}
      />

      <div className="mt-8 w-full max-w-md flex flex-col gap-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {bookmarks.map((b) => (
          <BookmarkCard key={b.id} bookmark={b} onDelete={deleteBookmark} />
        ))}
      </div>
    </div>
  );
}

export default App;
