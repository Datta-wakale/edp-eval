import React, {useState} from 'react';
import styles from './styles.module.css';

type Props = {
  message: string;
};

export default function MaintainanceAnnoucement({
  message,
}: Props) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.announcement}>
      <span>
         {message}
      </span>

      <button
        type="button"
        onClick={() => setIsVisible(false)}
        aria-label="Close maintenance announcement">
        ×
      </button>
    </div>
  );
}