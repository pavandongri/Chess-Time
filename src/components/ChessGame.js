import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import WinnerDialog from './WinnerDialog';

// -------------------- Persistence helpers --------------------
const GAME_STATE_KEY = 'chessGameState';

const saveGameState = (fen, history = []) => {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(GAME_STATE_KEY, JSON.stringify({ fen, history }));
    } catch (err) {
        console.warn('Unable to save game state', err);
    }
};

const loadGameState = () => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(GAME_STATE_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
};

// --------------------------------------------------------------

const loadStockfish = () => {
    try {
        return new Worker('/stockfish/stockfish.js');
    } catch (err) {
        console.error('Failed to load Stockfish worker:', err);
        return null;
    }
};

const ChessGame = ({ difficulty, onBack, resume }) => {
    const gameRef = useRef(new Chess());
    const [game, setGame] = useState(new Chess());
    const [engineReady, setEngineReady] = useState(false);
    const [status, setStatus] = useState('Initializing engine...');
    const [winner, setWinner] = useState(null);
    const stockfishRef = useRef(null);
    const [boardWidth, setBoardWidth] = useState(500);
    const [history, setHistory] = useState([]);

    // ───────────────────── Resume saved game ─────────────────────
    useEffect(() => {
        const saved = loadGameState();
        if (saved?.fen && saved?.history) {
            // Replay history on a fresh Chess instance for full internal state sync
            const restoredGame = restoreGameFromHistory(saved.history);
            gameRef.current = restoredGame;
            setGame(new Chess(restoredGame.fen()));
            setHistory(saved.history);
            setStatus('Resumed saved game');
        }
    }, []);
    // ──────────────────────────────────────────────────────────────

    const restoreGameFromHistory = (history) => {
        const chess = new Chess();
        chess.reset();
        history.forEach((move) => {
            // Move can be SAN or UCI, use chess.move(move)
            chess.move(move);
        });
        return chess;
    };

    const depth = useMemo(() => {
        return difficulty <= 4 ? 4 : difficulty <= 6 ? 6 : 10;
    }, [difficulty]);

    // -------------------- Highlight checked king -----------------
    const getCheckedKingSquare = () => {
        if (!gameRef.current.inCheck()) return null;

        const board = gameRef.current.board();
        const turn = gameRef.current.turn(); // 'w' or 'b'
        const kingSquareIndex = board.flat().findIndex(
            (piece) => piece && piece.type === 'k' && piece.color === turn
        );

        if (kingSquareIndex === -1) return null;

        const row = Math.floor(kingSquareIndex / 8);
        const col = kingSquareIndex % 8;
        const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

        return `${files[col]}${8 - row}`;
    };

    const checkedSquare = getCheckedKingSquare();

    const customSquareStyles = checkedSquare
        ? {
            [checkedSquare]: {
                boxShadow: 'inset 0 0 0 4px red',
                borderRadius: '8px',
            },
        }
        : {};

    // -------------------- Responsive board width -----------------
    useEffect(() => {
        const updateBoardWidth = () => {
            const maxWidth = Math.min(window.innerWidth - 40, 500);
            setBoardWidth(maxWidth > 300 ? maxWidth : 300);
        };

        updateBoardWidth();
        window.addEventListener('resize', updateBoardWidth);
        return () => window.removeEventListener('resize', updateBoardWidth);
    }, []);

    // -------------------- Stockfish setup ------------------------
    useEffect(() => {
        const sf = loadStockfish();
        if (!sf) {
            setStatus('Failed to load Stockfish engine');
            return;
        }
        stockfishRef.current = sf;
        sf.postMessage('uci');
        sf.onmessage = (event) => {
            const line = typeof event === 'string' ? event : event.data;

            if (line === 'uciok') {
                sf.postMessage(`setoption name Skill Level value ${difficulty}`);
                sf.postMessage('isready');
            }

            if (line === 'readyok') {
                setEngineReady(true);
                setStatus('Engine ready. Your move.');
            }

            if (line.startsWith('bestmove')) {
                const moveStr = line.split(' ')[1];
                if (moveStr === '(none)') {
                    setStatus('Game Over');
                    return;
                }

                try {
                    const moveResult = gameRef.current.move({
                        from: moveStr.slice(0, 2),
                        to: moveStr.slice(2, 4),
                        promotion: 'q',
                    });

                    if (!moveResult) {
                        console.warn('Engine suggested invalid move:', moveStr);
                        stockfishRef.current.postMessage(`position fen ${gameRef.current.fen()}`);
                        stockfishRef.current.postMessage(`go depth ${depth}`);
                        setStatus('Engine made invalid move, retrying...');
                        return;
                    }

                    const newHistory = [...history, moveStr];
                    setHistory(newHistory);
                    setGame(new Chess(gameRef.current.fen()));
                    saveGameState(gameRef.current.fen(), newHistory);

                    setStatus('Your move');
                    checkGameOver();
                } catch (error) {
                    console.error('Invalid move by engine:', error);
                    setStatus('Engine error with move');
                }
            }
        };

        return () => {
            sf.terminate();
            stockfishRef.current = null;
        };
    }, [difficulty, depth, history]);
    // --------------------------------------------------------------

    // -------------------- Utilities ------------------------------
    const checkGameOver = () => {
        if (gameRef.current.isGameOver()) {
            if (gameRef.current.isCheckmate()) {
                const winnerColor = gameRef.current.turn() === 'w' ? 'Black' : 'White';
                setWinner(winnerColor);
                setStatus(`${winnerColor} wins by checkmate!`);
            } else if (gameRef.current.isDraw()) {
                setWinner('draw');
                setStatus('Game ended in a draw');
            } else if (gameRef.current.isStalemate()) {
                setWinner('draw');
                setStatus('Game ended in stalemate');
            } else if (gameRef.current.isInsufficientMaterial()) {
                setWinner('draw');
                setStatus('Game ended due to insufficient material');
            }
        }
    };

    const makeAIMove = () => {
        if (!engineReady || gameRef.current.isGameOver()) {
            setStatus('Game over or engine not ready');
            return;
        }
        stockfishRef.current.postMessage(`position fen ${gameRef.current.fen()}`);
        stockfishRef.current.postMessage(`go depth ${depth}`);
        setStatus('Stockfish thinking...');
    };

    // -------------------- Player move ----------------------------
    const onDrop = (sourceSquare, targetSquare) => {
        try {
            const move = gameRef.current.move({
                from: sourceSquare,
                to: targetSquare,
                promotion: 'q',
            });

            if (!move) return false;

            const newHistory = [...history, move.san];
            setHistory(newHistory);
            setGame(new Chess(gameRef.current.fen()));
            saveGameState(gameRef.current.fen(), newHistory);

            setStatus("Stockfish's turn");

            setTimeout(() => {
                makeAIMove();
                checkGameOver();
            }, 300);

            return true;
        } catch (error) {
            console.error('Error making move:', error);
            return false;
        }
    };

    // -------------------- Take back ------------------------------
    const handleTakeBack = () => {
        if (history.length < 2) {
            setStatus('No moves to take back');
            return;
        }

        gameRef.current.undo(); // AI move
        gameRef.current.undo(); // player move
        setGame(new Chess(gameRef.current.fen()));
        setWinner(null);

        const newHistory = history.slice(0, history.length - 2);
        setHistory(newHistory);
        saveGameState(gameRef.current.fen(), newHistory);

        setStatus('Take back move. Your turn.');
    };

    // -------------------- Back to menu ---------------------------
    const handleBack = () => {
        onBack();
    };

    const currentTurn = gameRef.current.turn() === 'w' ? 'White' : 'Black';

    // -------------------- Render --------------------------------
    return (
        <div className="flex flex-col items-center justify-center px-4 font-mono text-white">
            <header className="w-full flex flex-col md:flex-row justify-between items-center mb-6 px-2 select-none gap-4 md:gap-0">
                <div className="flex flex-col space-y-1 items-center md:items-start">
                    <div className="text-sm font-semibold mt-2">
                        Difficulty: <span>{difficulty}</span>
                    </div>
                    {
                        gameRef.current.isGameOver()
                            ?
                            <div className='text-lg font-semibold mt-1'>
                                Game Over
                            </div>
                            :
                            <div>
                                <div className="text-lg font-semibold mt-1">
                                    Current Turn:{' '}
                                    <span className={currentTurn === 'White' ? 'text-yellow-400' : 'text-blue-400'}>{currentTurn}</span>
                                </div>
                                <div className="text-sm mt-1">{status}</div>
                            </div>
                    }
                </div>
            </header>

            <Chessboard
                position={game.fen()}
                onPieceDrop={onDrop}
                boardWidth={boardWidth}
                customBoardStyle={{
                    maxWidth: '100%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    borderRadius: 8,
                }}
                customSquareStyles={customSquareStyles}
            />

            <div className='w-full flex justify-between items-center w-full mt-[2rem]'>

                <button
                    onClick={handleBack}
                    aria-label="Back"
                    className="text-1xl p-2 font-bold transition-colors hover:text-yellow-400 border-[1px] border-yellow-400 rounded"
                    title="Back"
                >
                    ← Home
                </button>

                {
                    gameRef.current.isGameOver() &&
                    <div className="">
                        <div className='text-1xl p-2 rounded font-bold border border-yellow-400 cursor-pointer'>
                            {
                                gameRef.current.isCheckmate() &&
                                <div> {gameRef.current.turn() === 'w' ? 'White' : 'Black'} Wins</div>
                            }
                            {
                                gameRef.current.isDraw() && <div> Draw </div>

                            }
                            {
                                gameRef.current.isStalemate() && <div> Stalemate </div>
                            }
                        </div>

                    </div>

                }

                <button
                    onClick={handleTakeBack}
                    disabled={history.length < 2}
                    className="text-1xl p-2 border-[1px] border-yellow-400 rounded bg-yellow-600 hover:bg-yellow-700 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                    title="Take back"
                    aria-label="Take back move"
                >
                    ↩️ Take Back
                </button>


            </div>
        </div>
    );
};

export default ChessGame;