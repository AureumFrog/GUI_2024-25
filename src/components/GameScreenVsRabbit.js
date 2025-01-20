// src/components/GameScreenVsRabbit.js
import React, { useEffect, useRef, useState } from 'react';
import GameLogicVsRabbit from '../game_logic/GameLogicVsRabbit';
import './GameScreen.css';

const GameScreenVsRabbit = ({
                                nickname,
                                difficulty,
                                onBack
                            }) => {
    const canvasRef = useRef(null);

    const [isGameRunning, setIsGameRunning] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [winner, setWinner] = useState(null);

    // Dodajemy liczniki
    const [rabbitCarrotCount, setRabbitCarrotCount] = useState(0);
    const [snakeMiceCount, setSnakeMiceCount] = useState(0);

    const [countdown, setCountdown] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [isCountingDown, setIsCountingDown] = useState(false);

    useEffect(() => {
        console.log('[GameScreenVsRabbit] useEffect - init');
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Inicjalizacja logiki
        GameLogicVsRabbit.initialize(context, () => {
            console.log('[GameScreenVsRabbit] images loaded');
            setImagesLoaded(true);
        });

        // Obsługa klawiszy
        const handleKeyDown = (e) => {
            GameLogicVsRabbit.handleKeyPress(e.key);
        };
        window.addEventListener('keydown', handleKeyDown);

        // Nasłuch gameOver lub scoreUpdate
        const messageHandler = (ev) => {
            if (ev.data.type === 'gameOverVsRabbit') {
                console.log('[GameScreenVsRabbit] gameOverVsRabbit winner=', ev.data.winner);
                setIsGameRunning(false);
                setIsGameOver(true);
                setWinner(ev.data.winner);
            }
            if (ev.data.type === 'scoreUpdateVsRabbit') {
                // aktualizujemy UI
                setRabbitCarrotCount(ev.data.rabbitCarrotCount);
                setSnakeMiceCount(ev.data.snakeMiceCount);
            }
        };
        window.addEventListener('message', messageHandler);

        return () => {
            console.log('[GameScreenVsRabbit] cleanup');
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('message', messageHandler);

            // Zatrzymaj pętlę i zresetuj
            GameLogicVsRabbit.resetGame();
        };
    }, []);

    function startGame() {
        console.log('[GameScreenVsRabbit] startGame()');
        if (isCountingDown) {
            console.log('[GameScreenVsRabbit] already counting down, return');
            return;
        }
        if (isGameRunning) {
            console.log('[GameScreenVsRabbit] game is running, return');
            return;
        }

        setIsGameOver(false);
        setWinner(null);
        setIsGameRunning(false);

        if (!imagesLoaded) {
            console.log('[GameScreenVsRabbit] images not loaded, return');
            return;
        }

        setIsCountingDown(true);
        setCountdown(3);

        let countdownValue = 3;
        const countdownInterval = setInterval(() => {
            countdownValue--;
            console.log('[GameScreenVsRabbit] countdownValue=', countdownValue);
            if (countdownValue <= 0) {
                clearInterval(countdownInterval);
                setCountdown(null);
                setIsCountingDown(false);
                setIsGameRunning(true);

                console.log('[GameScreenVsRabbit] -> resetGame i startGame (logika vsRabbit)');
                // Zerujemy liczniki
                setRabbitCarrotCount(0);
                setSnakeMiceCount(0);

                GameLogicVsRabbit.resetGame();

                const speedMs = difficulty === 'łatwy' ? 200
                    : difficulty === 'średni' ? 100
                        : 50;
                GameLogicVsRabbit.startGame(speedMs);

            } else {
                setCountdown(countdownValue);
            }
        }, 1000);
    }

    function handleBackToMenu() {
        console.log('[GameScreenVsRabbit] handleBackToMenu');
        onBack();
    }

    return (
        <div className="game-screen">
            <button onClick={handleBackToMenu} className="back-button">
                Powrót do menu
            </button>
            <h1>Wąż vs Królik</h1>

            {/* Wyświetlamy liczniki */}
            <div className="info" style={{ marginBottom: '10px' }}>
                <div className="score-display">
                    Marchewki królika: {rabbitCarrotCount}
                </div>
                <div className="score-display">
                    Myszki węża: {snakeMiceCount}
                </div>
            </div>

            <div className="canvas-container" style={{ marginBottom: '10px' }}>
                <canvas
                    ref={canvasRef}
                    width="400"
                    height="400"
                    className="game-board"
                />
                {countdown !== null && (
                    <div className="countdown-overlay">
                        <div className="countdown-number">{countdown}</div>
                    </div>
                )}
            </div>

            {isGameOver && (
                <div className="game-over-message">
                    <h2>Koniec gry</h2>
                    {winner === 'rabbit' && <p>Królik wygrał!</p>}
                    {winner === 'snake' && <p>Wąż wygrał!</p>}

                    <button onClick={startGame} className="game-button">
                        Zagraj ponownie
                    </button>
                </div>
            )}

            {!isGameRunning && !isGameOver && countdown === null && (
                <button
                    onClick={startGame}
                    className={`game-button ${!imagesLoaded ? 'disabled' : ''}`}
                    disabled={!imagesLoaded}
                >
                    {imagesLoaded ? 'Start Gry' : 'Ładowanie...'}
                </button>
            )}
        </div>
    );
};

export default GameScreenVsRabbit;
