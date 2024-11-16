// GameScreen.js
import React, { useEffect, useRef, useState } from 'react';
import './GameScreen.css';
import GameLogic from '../game_logic/GameLogic';

const GameScreen = ({
                        nickname,
                        onBack,
                        difficulty,
                        onGameOver,
                        records,
                    }) => {
    const canvasRef = useRef(null);
    const [score, setScore] = useState(0);
    const [isGameRunning, setIsGameRunning] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false);
    const [maxScore, setMaxScore] = useState(0);
    const [countdown, setCountdown] = useState(null);
    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        GameLogic.initialize(context, () => {
            setImagesLoaded(true);
        });

        const handleKeyPress = (event) => {
            GameLogic.handleKeyPress(event.key);
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
            GameLogic.resetGame();
        };
    }, []);

    useEffect(() => {
        const messageHandler = (event) => {
            if (event.data.type === 'gameOver') {
                setIsGameOver(true);
                setIsGameRunning(false);
                // Usunięto wywołanie checkForNewRecord()
                onGameOver(score, difficulty);
            }
            if (event.data.type === 'scoreUpdate') {
                setScore(event.data.newScore);
                if (event.data.newScore > maxScore) {
                    setMaxScore(event.data.newScore);
                }
            }
        };

        window.addEventListener('message', messageHandler);

        return () => {
            window.removeEventListener('message', messageHandler);
        };
    }, [maxScore, score, difficulty, onGameOver]);

    useEffect(() => {
        // Aktualizujemy maxScore przy zmianie rekordów lub poziomu trudności
        const maxScoreForDifficulty = getMaxScoreForDifficulty(difficulty);
        setMaxScore(maxScoreForDifficulty);
    }, [records, difficulty]);

    const startGame = () => {
        if (!imagesLoaded) {
            // Jeśli obrazki jeszcze się nie załadowały, nie rozpoczynamy gry
            return;
        }
        setScore(0);
        setIsGameOver(false);
        setCountdown(3);

        let countdownValue = 3;
        const countdownInterval = setInterval(() => {
            countdownValue -= 1;
            if (countdownValue === 0) {
                clearInterval(countdownInterval);
                setCountdown(null);
                setIsGameRunning(true);
                GameLogic.resetGame();
                GameLogic.startGame(getGameSpeed());
            } else {
                setCountdown(countdownValue);
            }
        }, 1000);
    };

    const getGameSpeed = () => {
        if (difficulty === 'łatwy') return 200;
        if (difficulty === 'średni') return 100;
        if (difficulty === 'trudny') return 50;
        return 100;
    };

    const getMaxScoreForDifficulty = (difficultyLevel) => {
        const scoresForDifficulty = records
            .filter((record) => record.difficulty === difficultyLevel)
            .map((record) => record.score);

        return scoresForDifficulty.length > 0
            ? Math.max(...scoresForDifficulty)
            : 0;
    };

    const handleBackToMenu = () => {
        // Zapisujemy wynik przed powrotem do menu
        if (isGameRunning || isGameOver) {
            onGameOver(score, difficulty);
        }
        onBack(score, difficulty);
    };

    return (
        <div className="game-screen">
            <button onClick={handleBackToMenu} className="back-button">
                Powrót do menu
            </button>
            <h1>Gra w Węża</h1>
            <div className="info">
                <div className="score-display">Bieżący wynik: {score}</div>
                <div className="max-score-display">Maksymalny wynik: {maxScore}</div>
            </div>
            <div className="canvas-container">
                <canvas
                    ref={canvasRef}
                    id="game-board"
                    width="400"
                    height="400"
                    className="game-board"
                ></canvas>
                {countdown !== null && (
                    <div className="countdown-overlay">
                        <div className="countdown-number">{countdown}</div>
                    </div>
                )}
            </div>

            {isGameOver && (
                <div className="game-over-message">
                    <h2>Koniec gry</h2>
                    {/* Usunięto komunikat z gratulacjami */}
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

export default GameScreen;
