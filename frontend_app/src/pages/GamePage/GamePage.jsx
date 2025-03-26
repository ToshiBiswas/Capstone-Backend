
import './ChessGame.scss';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ChessGame from '../../components/ChessGame';
import LoadingScreen from '../../components/LoadingScreen';

function GamePage() {
  const [gameData, setGameData] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8080/getChessPuzzle')
      .then(response => {
        console.log("Server response:", response.data); // Log once
        setGameData(response.data);
      })
      .catch(error => console.error('Error fetching game data:', error));
  }, []);

  if (!gameData) {
    return <LoadingScreen />;
  }

  return (
    <div className="App">
      <ChessGame gameData={gameData} />
    </div>
  );
}

export default GamePage;
