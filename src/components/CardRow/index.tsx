import React from 'react';
import styles from './styles.module.css';

type CardItem = {
  title: string;
  href: string;
};

type CardRowProps = {
  items: CardItem[];
};

export default function CardRow({ items }: CardRowProps) {
  return (
    <div className={styles.row}>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className={styles.card}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}