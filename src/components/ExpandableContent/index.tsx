import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import styles from './styles.module.css';

type ExpandableContentProps = {
  children: React.ReactNode;
};

export default function ExpandableContent({
  children,
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [height, setHeight] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(
        isExpanded
          ? contentRef.current.scrollHeight
          : 0,
      );
    }
  }, [isExpanded]);

  const toggleContent = () => {
    setIsExpanded((previous) => !previous);
  };

  return (
    <div className={styles.wrapper}>
       <p>Click the show more to expand the paragraph</p>
       <p>main paragraph content below is expandable format</p>
      <div
        ref={contentRef}
        className={styles.content}
        style={{maxHeight: `${height}px`}}>
        <div className={styles.inner}>
          {children}
        </div>
      </div>

      <button type="button" className={styles.button}
        onClick={toggleContent}
        aria-expanded={isExpanded} >
       {isExpanded ? 'Show Less' : 'Show More'}
      </button>
    </div>
  );
}