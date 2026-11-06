import {useEffect, useState} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import {
  BOOKMARKS_STORAGE_KEY,
} from '@site/src/components/BookMarkManager';

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const savedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      const parsedBookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
      setBookmarks(Array.isArray(parsedBookmarks) ? parsedBookmarks : []);
    } catch {
      setBookmarks([]);
    }
  }, []);

  function removeBookmark(pathname: string) {
    const nextBookmarks = bookmarks.filter((bookmark) => bookmark !== pathname);
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(nextBookmarks));
    setBookmarks(nextBookmarks);
  }

  const filteredBookmarks = bookmarks.filter((bookmark) =>
    bookmark.toLowerCase().includes(searchTerm.toLowerCase().trim()),
  );

  return (
    <Layout title="Bookmarks">
      <main className="container margin-vert--lg">
        <div className="bookmark-page-header">
          <div>
            <h1>Bookmarks</h1>
            <p>{bookmarks.length} bookmarked {bookmarks.length === 1 ? 'page' : 'pages'}</p>
          </div>
          {bookmarks.length > 0 && (
            <label className="bookmark-search">
              <span>Search bookmarks</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by page path"
              />
            </label>
          )}
        </div>
        {bookmarks.length === 0 ? (
          <p>You have not bookmarked any pages yet.</p>
        ) : filteredBookmarks.length === 0 ? (
          <p>No bookmarked pages match “{searchTerm}”.</p>
        ) : (
          <ul className="bookmark-list">
            {filteredBookmarks.map((pathname) => (
              <li className="bookmark-list__item" key={pathname}>
                <Link to={pathname} className="bookmark-list__link">
                  {pathname}
                </Link>
                <button
                  type="button"
                  className="button button--link button--sm"
                  onClick={() => removeBookmark(pathname)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </Layout>
  );
}