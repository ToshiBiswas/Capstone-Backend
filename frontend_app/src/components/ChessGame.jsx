// ChessGame.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './ChessGame.scss';

function ChessGame({ gameData, onNextPuzzle }) {
  const navigate = useNavigate();

  // Puzzle data from API
  const puzzleMoves = gameData.moves.split(' ');
  const initialFEN = gameData.fen;
  const initialTurn = initialFEN.split(' ')[1]; // "w" or "b"
  // The user always plays opposite of initial turn (computer always moves first)
  const userColor = initialTurn === 'w' ? 'black' : 'white';

  // Puzzle state
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess(initialFEN));
  const [notification, setNotification] = useState('');
  // For hints & highlighting
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [hintSquare, setHintSquare] = useState(null);

  // Auto-play the computer's first move after a 500ms delay
  useEffect(() => {
    if (puzzleMoves.length > 0 && puzzleIndex === 0) {
      setTimeout(() => {
        const computerUCI = puzzleMoves[0];
        try {
          const move = game.move({
            from: computerUCI.slice(0, 2),
            to: computerUCI.slice(2, 4),
            promotion: computerUCI.length > 4 ? computerUCI.slice(4) : undefined,
            sloppy: true,
          });
          if (move) {
            console.log("Computer move executed:", move.san);
            setGame(new Chess(game.fen()));
            setPuzzleIndex(1); // Now expect the user's move
          }
        } catch (error) {
          console.error("Error executing computer move:", error);
        }
      }, 500);
    } else {
      setPuzzleIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear any hint highlight when the puzzleIndex changes
  useEffect(() => {
    setHintSquare(null);
  }, [puzzleIndex]);

  // Board interaction: highlight valid moves on square click
  const onSquareClick = (square) => {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      const moves = game.moves({ square, verbose: true });
      const newHighlights = {};
      moves.forEach((m) => {
        newHighlights[m.to] = { background: 'rgba(0,255,0,0.4)' };
      });
      newHighlights[square] = { background: 'rgba(255,255,0,0.4)' };
      setHighlightedSquares(newHighlights);
      setSelectedSquare(square);
    } else {
      setHighlightedSquares({});
      setSelectedSquare(null);
    }
  };

  // Helper to revert the board state if the user's move is incorrect
  const revertMove = (previousFEN) => {
    setNotification('Wrong move!');
    setTimeout(() => {
      setNotification('');
      const newGame = new Chess(previousFEN);
      setGame(newGame);
    }, 1500);
  };

  // onDrop: Process the user's move (excluding promotion moves)
  const onDrop = (sourceSquare, targetSquare) => {
    const piece = game.get(sourceSquare);
    if (!piece || piece.color !== game.turn()) return false;

    const validMoves = game.moves({ square: sourceSquare, verbose: true });
    if (!validMoves.some((m) => m.to === targetSquare)) return false;

    const previousFEN = game.fen();
    setHighlightedSquares({});

    // Check for promotion candidate.
    // When a pawn is dropped on the promotion rank, we return false so that
    // the built-in promotion UI is triggered.
    const promotionCandidate = validMoves.find(
      (m) =>
        m.to === targetSquare &&
        m.piece === 'p' &&
        (targetSquare[1] === '8' || targetSquare[1] === '1')
    );
    if (promotionCandidate) {
      return false; // Let the built-in promotion UI handle it via onPromote.
    }

    try {
      const move = game.move({ from: sourceSquare, to: targetSquare, sloppy: true });
      if (!move) return false;
      console.log("User move executed:", move.san);
      setGame(new Chess(game.fen()));

      const userUCI = move.from + move.to + (move.promotion ? move.promotion : '');
      if (userUCI !== puzzleMoves[puzzleIndex]) {
        setTimeout(() => {
          revertMove(previousFEN);
        }, 1000);
        return false;
      }

      let newIndex = puzzleIndex + 1;
      setPuzzleIndex(newIndex);

      // Auto-play computer's next move after a 300ms delay
      if (newIndex < puzzleMoves.length) {
        setTimeout(() => {
          const computerUCI = puzzleMoves[newIndex];
          try {
            const compMove = game.move({
              from: computerUCI.slice(0, 2),
              to: computerUCI.slice(2, 4),
              promotion: computerUCI.length > 4 ? computerUCI.slice(4) : undefined,
              sloppy: true,
            });
            if (compMove) {
              console.log("Computer move executed:", compMove.san);
              setGame(new Chess(game.fen()));
              newIndex++;
              setPuzzleIndex(newIndex);
            }
          } catch (err) {
            console.error("Error executing computer move:", err);
          }
        }, 300);
      }
      return true;
    } catch (error) {
      console.error("Error executing user move:", error);
      revertMove(previousFEN);
      return false;
    }
  };

  // onPromote: Use the built-in promotion UI to select a promotion piece.
  // For demonstration, we always promote to a queen.
  const onPromote = async (sourceSquare, targetSquare) => {
    return Promise.resolve('q');
  };

  // Hint logic: highlight the "from" square of the expected user move
  const handleHint = () => {
    if (!puzzleComplete && puzzleIndex < puzzleMoves.length && puzzleIndex % 2 === 1) {
      const userMove = puzzleMoves[puzzleIndex];
      const fromSquare = userMove.slice(0, 2);
      setHintSquare(fromSquare);
      // You could track a "hint used" flag here if desired
    }
  };

  const mergedSquareStyles = {
    ...highlightedSquares,
    ...(hintSquare ? { [hintSquare]: { background: 'rgba(255, 0, 0, 0.5)' } } : {}),
  };

  const puzzleComplete = puzzleIndex >= puzzleMoves.length;

  const handleNextPuzzle = () => {
    // Reset hint and flags for next puzzle if applicable
    setHintSquare(null);
    if (typeof onNextPuzzle === 'function') {
      onNextPuzzle();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className="game-container">
      <div className="board-wrapper">
        {/* Header with logo (left) and title (center) */}
        <header className="game-topbar">
          <div className="logo-container" onClick={() => navigate('/homepage')}>
            <img
              className="game-logo"
              src="/assets/ChessChallengers.jpg"
              alt="Chess Challengers"
            />
          </div>
          <div className="title-container">
            <h1>Chess Challenge</h1>
          </div>
        </header>

        {notification && <div className="notification">{notification}</div>}

        <div className="chessboard-container">
          <Chessboard
            position={game.fen()}
            onSquareClick={onSquareClick}
            onPieceDrop={onDrop}
            onPromote={onPromote}
            boardWidth={500}
            animationDuration={300}
            customSquareStyles={mergedSquareStyles}
            boardOrientation={userColor}
          />
        </div>

        <div className="hint-container">
          {!puzzleComplete && (
            <button className="hint-button" onClick={handleHint}>
              Hint
            </button>
          )}
        </div>

        {puzzleComplete && (
          <div className="puzzle-finished">
            <h2>Puzzle Solved!</h2>
            <p>Finished Moves: {puzzleMoves.join(' ')}</p>
            <div className="next-button-container">
              <button onClick={handleNextPuzzle}>Next Puzzle</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChessGame;
