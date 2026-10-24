import { useState, useEffect } from "react";
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
      <form
        onSubmit={addBookmark}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
      >
        <input
          type="text"
          placeholder="Website Name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Website Url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="border p-2 rounded"
        />
        <select
          value={category_id}
          onChange={(e) => setCategory_id(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select a Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Add Bookmark
        </button>
      </form>
      <div className="mt-8 w-full max-w-md flex flex-col gap-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {bookmarks.map((b) => (
          <div
            key={b.id}
            className="bg-white p-4 rounded-lg shadow flex justify-between items-center"
          >
            <div>
              <h2 className="font-bold text-lg">{b.title}</h2>
              <a
                href={`https://${b.url}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                {b.url}
              </a>
              <span className="block text-sm text-gray-500 mt-1">
                {b.category}
              </span>
            </div>
            <button
              onClick={() => deleteBookmark(b.id)}
              className="text-red-500 font-bold hover:text-red-700"
            >
              X
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
