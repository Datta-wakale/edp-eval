import React, { useEffect, useState } from 'react';
import TOC from '@theme-original/TOC';
import type TOCType from '@theme/TOC';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof TOCType>;

type TOCItem = {
  id: string;
  value: string;
  level: number;
  children?: TOCItem[];
};

export default function TOCWrapper(props: Props) {
  const [mountedHeadingIds, setMountedHeadingIds] =
    useState<Set<string> | null>(null);

  useEffect(() => {
    const headingIds = new Set(
      Array.from(
        document.querySelectorAll<HTMLElement>(
          'h2[id], h3[id], h4[id], h5[id], h6[id]',
        ),
      )
        .map((heading) => heading.id)
        .filter(Boolean),
    );

    setMountedHeadingIds(headingIds);
  }, []);

  // SSR + first client render:
  // keep the original TOC to avoid hydration mismatch.
  if (mountedHeadingIds === null) {
    return <TOC {...props} />;
  }

  const filteredTOC = filterTOCItems(
    props.toc as TOCItem[],
    mountedHeadingIds,
  );

  return <TOC {...props} toc={filteredTOC} />;
}

function filterTOCItems(
  items: TOCItem[],
  mountedHeadingIds: Set<string>,
): TOCItem[] {
  return items
    .filter((item) => mountedHeadingIds.has(item.id))
    .map((item) => ({
      ...item,
      children: item.children
        ? filterTOCItems(item.children, mountedHeadingIds)
        : undefined,
    }));
}