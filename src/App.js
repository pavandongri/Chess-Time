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

  useEffect(() => {
    const saved = localStorage.getItem('chessGameState');
    if (saved) {
      setCanResume(true);
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
          />
        ) : (
          <ChessGame
            difficulty={difficulty}
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