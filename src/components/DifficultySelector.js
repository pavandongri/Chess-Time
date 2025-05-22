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
}) => {
  const selectedOption = options.find((opt) => opt.value === difficulty);

  return (
    <div className="max-w-md w-full bg-blue-950 bg-opacity-90 rounded-2xl shadow-xl p-10 text-center backdrop-blur-md border border-blue-700 mx-auto">
      <h1 className="text-3xl font-extrabold mb-8 tracking-tight text-white drop-shadow-lg">
        It's Chess Time 😎
      </h1>

      <label
        htmlFor="difficulty-select"
        className="block text-blue-500 font-semibold text-xl mb-3 text-left text-center"
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

      <button
        onClick={startGame}
        className="mt-8 w-full py-3 bg-blue-500 hover:bg-blue-600 active:bg-blue-600 rounded-xl text-xl font-semibold shadow-lg transition duration-300 text-white"
        aria-label="Start Chess Game"
      >
        Start Game
      </button>
    </div>
  );
};

export default DifficultySelector;
