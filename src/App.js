import React, { useState, useEffect } from 'react';
import DifficultySelector from './components/DifficultySelector';
import ChessGame from './components/ChessGame';
import Footer from './components/Footer';
import Header from './components/Header';

const App = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);
  const [resumeGame, setResumeGame] = useState(false);
  const [canResume, setCanResume] = useState(false);
  const [userPieceColor, setUserPieceColor] = useState('');
  const colorsArray = ['b', 'w']

  useEffect(() => {
    const saved = localStorage.getItem('chessGameState');
    const savedUserPieceColor = localStorage.getItem('userPieceColor')
    if (saved) {
      setCanResume(true);
      setUserPieceColor(savedUserPieceColor)
    }

    if (!savedUserPieceColor && !userPieceColor) {
      const randomColor = colorsArray[Math.floor(Math.random() * colorsArray.length)];
      setUserPieceColor(randomColor);
    }

  }, []);

  const startGame = () => {
    localStorage.removeItem('chessGameState'); // Clear old game
    setResumeGame(false);
    setGameStarted(true);
  };

  const resumeSavedGame = () => {
    setResumeGame(true);
    setGameStarted(true);
  };

  return (
    <div className="bg-blue-950">
      <Header />
      <div className="mt-[-12%] md:mt-0 min-h-screen flex items-center justify-center px-4">
        {!gameStarted ? (
          <DifficultySelector
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            startGame={startGame}
            canResume={canResume}
            resumeGame={resumeSavedGame}
            userPieceColor={userPieceColor}
            setUserPieceColor={setUserPieceColor}
          />
        ) : (
          <ChessGame
            difficulty={difficulty}
            userPieceColor={userPieceColor}
            onBack={() => {
              setGameStarted(false);
              setResumeGame(false);
              setCanResume(!!localStorage.getItem('chessGameState'));
            }}
            resume={resumeGame}
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default App;