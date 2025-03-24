// LoadingScreen.jsx
import React from 'react';
import './LoadingScreen.scss';

const LoadingScreen = () => {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <h2 className="loading-text">Loading Puzzle...</h2>
    </div>
  );
};

export default LoadingScreen;
