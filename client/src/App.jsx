import { useState, useEffect } from "react";
import BookmarkCard from "./components/BookmarkCard";
import BookmarkForm from "./components/BookmarkForm";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function App() {
  // --- AUTH STATE ---
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [isLogin, setIsLogin] = useState(true); // true = Login screen, false = Register screen
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // --- APP STATE ---
  const [bookmarks, setBookmarks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [category_id, setCategory_id] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch data ONLY if we have a token
  useEffect(() => {
    if (token) {
      fetchBookmarks();
      fetchCategories();
    }
  }, [token]);

  // Helper to attach the VIP Pass (token) to every request
  const getHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  });

  // --- AUTH FUNCTIONS ---
  async function handleAuth(e) {
    e.preventDefault();
    setAuthError("");
    const endpoint = isLogin ? "/login" : "/register";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Authentication failed");

      if (isLogin) {
        // Save token to browser memory and state
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setEmail("");
        setPassword("");
      } else {
        // If they registered, switch them to the login screen
        setIsLogin(true);
        alert("Registration successful! Please log in.");
        setPassword("");
      }
    } catch (err) {
      setAuthError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken("");
    setBookmarks([]); // Clear private data from screen
  }

  // --- BOOKMARK FUNCTIONS ---
  async function fetchBookmarks() {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/bookmarks`, {
        headers: getHeaders(),
      });
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
    if (!title || !url || !category_id) {
      alert("Please fill in all fields before adding a bookmark.");
      return;
    }
    if (!url.includes(".")) {
      alert("Please enter a valid website URL (e.g., google.com).");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/bookmarks`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title, url, category_id }),
      });
      if (!res.ok) throw new Error("Failed to add bookmark");

      const newBookmark = await res.json();

      // Add the category name to the new bookmark for the UI
      const catName = categories.find(
        (c) => c.id === parseInt(category_id),
      )?.name;
      newBookmark.category = catName;

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
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setBookmarks(bookmarks.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  // --- RENDER LOGIC ---

  // 1. IF NO TOKEN, SHOW LOGIN/REGISTER SCREEN
  if (!token) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
        <form
          onSubmit={handleAuth}
          className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm flex flex-col gap-4"
        >
          <h1 className="text-2xl font-bold text-center">
            {isLogin ? "Login" : "Register"}
          </h1>

          {authError && (
            <p className="text-red-500 text-sm text-center">{authError}</p>
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border p-2 rounded"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border p-2 rounded"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            {isLogin ? "Login" : "Register"}
          </button>

          <p
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-center text-blue-500 cursor-pointer hover:underline"
          >
            {isLogin
              ? "Need an account? Register"
              : "Already have an account? Login"}
          </p>
        </form>
      </div>
    );
  }

  // 2. IF TOKEN EXISTS, SHOW THE MAIN APP
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
      {/* Header with Logout */}
      <div className="w-full max-w-md flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Bookmarks</h1>
        <button
          onClick={handleLogout}
          className="text-red-500 font-semibold hover:underline"
        >
          Logout
        </button>
      </div>

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
