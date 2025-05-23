import React from 'react';
import Select from 'react-select';

const options = [...Array(8)].map((_, i) => ({
  value: i + 1,
  label: `Level ${i + 1}`,
}));

const DifficultySelector = ({
  difficulty = 1,
  setDifficulty = () => { },
  startGame = () => { },
  canResume = false,
  resumeGame = () => { },
  userPieceColor = 'w',
  setUserPieceColor = () => { },
}) => {
  const selectedOption = options.find((opt) => opt.value === difficulty);

  const handlePieceColor = (color = '') => {
    if (!color) return
    setUserPieceColor(color)
    localStorage.setItem('userPieceColor', color)
  }

  return (
    <div className="max-w-md w-full bg-blue-950 bg-opacity-90 rounded-2xl shadow-xl p-10 text-center backdrop-blur-md border border-blue-700 mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-white drop-shadow-lg">
        It's Chess Time 😎
      </h1>

      <label
        htmlFor="difficulty-select"
        className="block text-blue-500 font-semibold text-xl mb-3 text-center"
      >
        Select Difficulty Level
      </label>

      <Select
        inputId="difficulty-select"
        options={options}
        value={selectedOption}
        onChange={(selected) => setDifficulty(selected.value)}
        isSearchable={false}
        aria-label="Select difficulty level"
        className="mb-6"
      />

      <div className="mb-6">
        <label className="block text-blue-500 font-semibold text-xl mb-3 text-center">
          Choose Your Side
        </label>
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handlePieceColor('w')}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${userPieceColor === 'w'
              ? 'bg-white text-black shadow-inner'
              : 'bg-gray-700 text-white'
              }`}
          >
            White
          </button>
          <button
            onClick={() => handlePieceColor('b')}
            className={`px-4 py-2 rounded-lg font-semibold transition duration-300 ${userPieceColor === 'b'
              ? 'bg-white text-black shadow-inner'
              : 'bg-gray-700 text-white'
              }`}
          >
            Black
          </button>
        </div>
      </div>

      <button
        onClick={startGame}
        className="w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-600 rounded-xl text-xl font-semibold shadow-lg transition duration-300 text-white"
        aria-label="Start New Chess Game"
      >
        Start New Game
      </button>

      {canResume && (
        <button
          onClick={resumeGame}
          className="mt-4 w-full py-3 bg-green-500 hover:bg-green-600 active:bg-green-600 rounded-xl text-xl font-semibold shadow-lg transition duration-300 text-white"
          aria-label="Resume Previous Chess Game"
        >
          ♻️ Resume Previous Game
        </button>
      )}
    </div>
  );
};

export default DifficultySelector;
