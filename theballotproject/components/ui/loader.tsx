import React from 'react';
import { CSSProperties } from 'react';

const Loader = () => {
  return (
    <div style={styles.preloader}>
      <div style={styles.loaderCircle}></div>
    </div>
  );
};

const styles: { preloader: CSSProperties; loaderCircle: CSSProperties } = {
  preloader: {
    position: 'fixed',
    inset: 0,
    zIndex: 999999,
    overflow: 'hidden',
    backgroundColor: '#FFF', // Couleur d'arrière-plan blanche
    transition: 'all 0.6s ease-out',
  },
  loaderCircle: {
    content: '',
    position: 'fixed',
    top: 'calc(50% - 30px)',
    left: 'calc(50% - 30px)',
    border: '6px solid #ffffff',
    borderColor: 'blue transparent blue transparent', // Couleur d'accent bleu
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    animation: 'animate-preloader 1.5s linear infinite',
  }
};

export default Loader;
