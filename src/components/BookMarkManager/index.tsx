import {useEffect, useState} from 'react';
import {useLocation} from '@docusaurus/router';

export const BOOKMARKS_STORAGE_KEY = 'documentation_bookmarks';

function readBookmarks(): string[] {
  try {
    const savedBookmarks = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    const bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
    return Array.isArray(bookmarks) ? bookmarks : [];
  } catch {
    return [];
  }
}

export default function BookMarkManager() {
  const {pathname} = useLocation();
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  useEffect(() => {
    setBookmarks(readBookmarks());
  }, [pathname]);

  const isBookmarked = bookmarks.includes(pathname);
  console.log("isBookmarked ::25", isBookmarked);
  function toggleBookmark() {
    const nextBookmarks = isBookmarked
      ? bookmarks.filter((bookmark) => bookmark !== pathname)
      : [...bookmarks, pathname];

    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(nextBookmarks));
    setBookmarks(nextBookmarks);
  }

  return (
    <button
      type="button"
      className={`bookmark-button${isBookmarked ? ' bookmark-button--active' : ''}`}
      onClick={toggleBookmark}
      aria-pressed={isBookmarked}
      aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this page'}>
      <span aria-hidden="true">🔖</span>
    </button>
  );
}