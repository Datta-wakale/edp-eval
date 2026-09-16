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
      {items.map((item,index) => (
        <a
          key={`${item.href}-${index}`}
          href={item.href}
          className={styles.card}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}