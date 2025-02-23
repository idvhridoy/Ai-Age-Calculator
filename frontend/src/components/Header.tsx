import React from 'react';
import styles from './Header.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title} data-text="Project FuturAge">Project FuturAge</h1>
    </header>
  );
};

export default Header;
