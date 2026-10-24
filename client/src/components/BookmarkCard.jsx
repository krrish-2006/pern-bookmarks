function BookmarkCard({ bookmark, onDelete }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
      <div>
        <h2 className="font-bold text-lg">{bookmark.title}</h2>
        <a
          href={`https://${bookmark.url}`}
          target="_blank"
          rel="noreferrer"
          className="text-blue-500 hover:underline"
        >
          {bookmark.url}
        </a>
        <span className="block text-sm text-gray-500 mt-1">
          {bookmark.category}
        </span>
      </div>
      <button
        onClick={() => onDelete(bookmark.id)}
        className="text-red-500 font-bold hover:text-red-700"
      >
        X
      </button>
    </div>
  );
}

export default BookmarkCard;
