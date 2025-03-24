import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import './ChessGame.scss';

function ChessGame({ gameData, onNextPuzzle }) {
  const navigate = useNavigate();

  // Puzzle data
  const puzzleMoves = gameData.moves.split(' ');
  const initialFEN = gameData.fen;
  const initialTurn = initialFEN.split(' ')[1]; // "w" or "b"
  const userColor = initialTurn === 'w' ? 'black' : 'white';

  // puzzleIndex tracks next expected move
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess(initialFEN));
  const [notification, setNotification] = useState('');
  const [pendingMove, setPendingMove] = useState(null);
  const [showPromotionModal, setShowPromotionModal] = useState(false);

  // For highlights & hint
  const [highlightedSquares, setHighlightedSquares] = useState({});
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [hintSquare, setHintSquare] = useState(null);

  // Auto-play computer's first move
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

  // Clear hint on puzzleIndex change
  useEffect(() => {
    setHintSquare(null);
  }, [puzzleIndex]);

  // Board interaction
  const onSquareClick = (square) => {
    const piece = game.get(square);
    if (piece && piece.color === game.turn()) {
      const moves = game.moves({ square, verbose: true });
      const newHighlights = {};
      moves.forEach((m) => {
        newHighlights[m.to] = { background: 'rgba(0, 255, 0, 0.4)' };
      });
      newHighlights[square] = { background: 'rgba(255, 255, 0, 0.4)' };
      setHighlightedSquares(newHighlights);
      setSelectedSquare(square);
    } else {
      setHighlightedSquares({});
      setSelectedSquare(null);
    }
  };

  const revertMove = (previousFEN) => {
    setNotification('Wrong move!');
    setTimeout(() => {
      setNotification('');
      const newGame = new Chess(previousFEN);
      setGame(newGame);
    }, 1500);
  };

  const onDrop = (sourceSquare, targetSquare) => {
    const piece = game.get(sourceSquare);
    if (!piece || piece.color !== game.turn()) return false;

    const validMoves = game.moves({ square: sourceSquare, verbose: true });
    if (!validMoves.some((m) => m.to === targetSquare)) return false;

    const previousFEN = game.fen();
    setHighlightedSquares({});

    // Check for promotion
    const promotionCandidate = validMoves.find(
      (m) =>
        m.to === targetSquare &&
        m.piece === 'p' &&
        (targetSquare[1] === '8' || targetSquare[1] === '1')
    );
    if (promotionCandidate) {
      setPendingMove({ from: sourceSquare, to: targetSquare });
      setShowPromotionModal(true);
      return false;
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

      // Auto-play computer's next move
      if (newIndex < puzzleMoves.length) {
        setTimeout(() => {
          const compMove = game.move({
            from: puzzleMoves[newIndex].slice(0, 2),
            to: puzzleMoves[newIndex].slice(2, 4),
            promotion: puzzleMoves[newIndex].length > 4
              ? puzzleMoves[newIndex].slice(4)
              : undefined,
            sloppy: true,
          });
          if (compMove) {
            setGame(new Chess(game.fen()));
            newIndex++;
            setPuzzleIndex(newIndex);
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

  const onPromotionSelect = (promotionPiece) => {
    if (pendingMove) {
      const previousFEN = game.fen();
      try {
        const move = game.move({
          from: pendingMove.from,
          to: pendingMove.to,
          promotion: promotionPiece,
          sloppy: true,
        });
        if (move) {
          console.log("User promotion move executed:", move.san);
          setGame(new Chess(game.fen()));
          const moveUCI = move.from + move.to + (move.promotion ? move.promotion : '');
          if (moveUCI !== puzzleMoves[puzzleIndex]) {
            setTimeout(() => {
              revertMove(previousFEN);
            }, 1000);
          } else {
            setPuzzleIndex(puzzleIndex + 1);
          }
        }
      } catch (error) {
        console.error("Error executing promotion move:", error);
        revertMove(previousFEN);
      }
    }
    setShowPromotionModal(false);
    setPendingMove(null);
  };

  // Puzzle completion
  const puzzleComplete = puzzleIndex >= puzzleMoves.length;
  const handleNextPuzzle = () => {
    if (typeof onNextPuzzle === 'function') {
      onNextPuzzle();
    } else {
      window.location.reload();
    }
  };

  // Hint logic
  const handleHint = () => {
    // Only if it's the user's turn (odd puzzleIndex) and puzzle not complete
    if (!puzzleComplete && puzzleIndex < puzzleMoves.length) {
      if (puzzleIndex % 2 === 1) {
        const userMove = puzzleMoves[puzzleIndex];
        const fromSquare = userMove.slice(0, 2);
        setHintSquare(fromSquare);
      }
    }
  };

  // Merge highlight squares with hint
  const mergedSquareStyles = {
    ...highlightedSquares,
    ...(hintSquare ? { [hintSquare]: { background: 'rgba(255, 0, 0, 0.5)' } } : {})
  };

  return (
    <div className="game-container">
      {/* We wrap everything in a fixed-width .board-wrapper to center with the board */}
      <div className="board-wrapper">
        <header className="game-topbar">
          <div className="logo-container" onClick={() => navigate('/homepage')}>
            <img
              className="game-logo"
              src="../../public/ChessChallengers.jpg"
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
            boardWidth={500}
            animationDuration={300}
            customSquareStyles={mergedSquareStyles}
            boardOrientation={userColor}
          />
        </div>

        {!puzzleComplete && (
          <div className="hint-container">
            <button className="hint-button" onClick={handleHint}>Hint</button>
          </div>
        )}

        {showPromotionModal && (
          <div className="promotion-modal">
            <p>Select promotion piece:</p>
            <button onClick={() => onPromotionSelect('q')}>Queen</button>
            <button onClick={() => onPromotionSelect('r')}>Rook</button>
            <button onClick={() => onPromotionSelect('b')}>Bishop</button>
            <button onClick={() => onPromotionSelect('n')}>Knight</button>
          </div>
        )}

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
