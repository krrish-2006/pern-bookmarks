function BookmarkForm({
  title,
  setTitle,
  url,
  setUrl,
  category_id,
  setCategory_id,
  categories,
  onSubmit,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="bg-white p-6 rounded-lg shadow-md w-full max-w-md flex flex-col gap-4"
    >
      <input
        type="text"
        placeholder="Website Name"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <input
        type="text"
        placeholder="Website Url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        className="border p-2 rounded"
        required
      />
      <select
        value={category_id}
        onChange={(e) => setCategory_id(e.target.value)}
        className="border p-2 rounded"
        required
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
  );
}
export default BookmarkForm;
