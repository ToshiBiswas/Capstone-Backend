import React from 'react';
import { useNavigate } from 'react-router-dom';
import './MenuPage.scss';

const MenuScreen = () => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate('/game');
  };

  return (
    <div className="menu-screen">
      <div className="popup-window">
        <img
          src="../../../public/ChessChallengers.jpg"
          alt="Chess Challengers Logo"
          className="menu-logo"
        />
        <button className="play-button" onClick={handlePlay}>
          Play
        </button>
      </div>
    </div>
  );
};

export default MenuScreen;
//src="../../../public/assets/ChessChallengers.jpg"
