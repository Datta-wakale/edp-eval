import React, { useMemo, useState } from 'react';
import styles from './styles.module.css';

type Capability = {
  id: string;
  title: string;
};

type CapabilityFilterProps = {
  capabilities: Capability[];
};

export default function CapabilityFilter({
  capabilities,
}: CapabilityFilterProps) {
  const [query, setQuery] = useState('');

  const normalizedQuery = query.toLowerCase();

  const filteredCapabilities = useMemo(() => {
    const matched: Capability[] = [];
    const unmatched: Capability[] = [];

    capabilities.forEach((capability) => {
      if (capability.title.toLowerCase().includes(normalizedQuery)) {
        matched.push(capability);
      } else {
        unmatched.push(capability);
      }
    });

    return [...matched, ...unmatched];
  }, [capabilities, normalizedQuery]);

  const hasMatch = capabilities.some((capability) =>
    capability.title.toLowerCase().includes(normalizedQuery),
  );

  const showNoResults = query !== '' && !hasMatch;

  return (
    <section>
      <input
        className={styles.search}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search capabilities..."
        aria-label="Search capabilities"
      />

      <div className={styles.grid}>
        {filteredCapabilities.map((capability) => {
          const isMatch = capability.title
            .toLowerCase()
            .includes(normalizedQuery);

          return (
            <div
              key={capability.id}
              className={`${styles.card} ${!isMatch ? styles.hidden : ''}`}
            >
              {capability.title}
            </div>
          );
        })}

        {showNoResults && (
          <div className={styles.noResults}>No capabilities found.</div>
        )}
      </div>
    </section>
  );
}