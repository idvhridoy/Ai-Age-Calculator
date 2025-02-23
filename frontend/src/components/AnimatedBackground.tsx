import React from 'react';
import styles from './AnimatedBackground.module.css';

const AnimatedBackground = () => {
  return (
    <div className={styles.background}>
      <div className={styles.grid}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div key={i} className={styles.gridLine} />
        ))}
      </div>
      
      <div className={styles.particles}>
        {Array.from({ length: 50 }).map((_, i) => (
          <div 
            key={i} 
            className={styles.particle}
            style={{
              '--x': `${Math.random() * 100}%`,
              '--y': `${Math.random() * 100}%`,
              '--duration': `${10 + Math.random() * 20}s`,
              '--delay': `${Math.random() * -20}s`,
              '--size': `${2 + Math.random() * 3}px`,
              '--glow': `rgba(${
                Math.random() > 0.5 
                  ? '6, 182, 212'
                  : '99, 102, 241'
              }, 0.5)`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className={styles.circles}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div 
            key={i} 
            className={styles.circle}
            style={{
              '--index': i,
            } as React.CSSProperties}
          />
        ))}
      </div>

      <div className={styles.scanline} />
    </div>
  );
};

export default AnimatedBackground;
