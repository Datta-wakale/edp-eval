import React, {useEffect, useState} from 'react';

type RecentlyViewedDoc = {
  id: string ;
  title: string;
  description: string;
};

type RecentlyViewedDocsProps = {
  currentDoc: RecentlyViewedDoc;
};

export default function RecentlyViewedDocs({
  currentDoc,
}: RecentlyViewedDocsProps) {
  const [recentlyViewedDocs, setRecentlyViewedDocs] = useState< RecentlyViewedDoc[] >([]);

  useEffect(() => {
    const savedDocs = localStorage.getItem('recently-viewed-docs');

    const previousDocs: RecentlyViewedDoc[] = savedDocs
      ? JSON.parse(savedDocs)
      : [];

    const updatedDocs = [
      currentDoc,
      ...previousDocs.filter(
        (doc) => doc.id !== currentDoc.id,
      ),
    ].slice(0, 5);

    setRecentlyViewedDocs(updatedDocs);

    localStorage.setItem('recently-viewed-docs',JSON.stringify(updatedDocs),);
  }, [currentDoc]);

  const clearHistory = () => {
  localStorage.removeItem('recently-viewed-docs');
  setRecentlyViewedDocs([]);
};

  return (
    <div>
      <h2>Recently Viewed Documents</h2>

      {recentlyViewedDocs.length === 0 ? (
        <p>No recently viewed documents</p>
      ) : (
        <ul>
          {recentlyViewedDocs.map((doc) => (
            <li key={doc.id}>
              <strong>{doc.title}</strong>
              {' — '}
              {doc.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}