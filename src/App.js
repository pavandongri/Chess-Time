import React, { useState } from 'react';
import DifficultySelector from './components/DifficultySelector';
import ChessGame from './components/ChessGame';
import Footer from './components/Footer';
import Header from './components/Header';

const App = () => {
  const [difficulty, setDifficulty] = useState(1);
  const [gameStarted, setGameStarted] = useState(false);

  const startGame = () => setGameStarted(true);

  return (
    <div className='bg-blue-950'>
      <Header />

      <div className="mt-[-20%] md:mt-0 min-h-screen flex items-center justify-center px-4">
        {!gameStarted ? (
          <DifficultySelector
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            startGame={startGame}
          />
        ) : (
          <ChessGame difficulty={difficulty} onBack={() => { setGameStarted(false) }} />
        )}
      </div>

      <div>
        <Footer />
      </div>
    </div>
  );
};

export default App;
