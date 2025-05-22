import React from 'react';

const WinnerDialog = ({ winner, onPlayAgain }) => {
  if (!winner) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-sm text-center shadow-xl">
        {winner === 'draw' ? (
          <>
            <h2 className="text-3xl font-extrabold mb-4 text-gray-900">Game Drawn</h2>
            <p className="mb-6 text-lg text-gray-700">The game ended in a draw.</p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold mb-4 text-yellow-600">{winner} Wins!</h2>
            <p className="mb-6 text-lg text-gray-700">Checkmate! Congratulations to {winner}.</p>
          </>
        )}
        <button
          onClick={onPlayAgain}
          className="bg-yellow-500 hover:bg-yellow-400 transition-colors rounded-lg px-6 py-3 font-semibold text-black shadow-md"
        >
          Play Again
        </button>
      </div>
    </div>
  );
};

export default WinnerDialog;
