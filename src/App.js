import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
    const [score, setScore] = useState(0);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [isGameOver, setIsGameOver] = useState(false); // Nowa zmienna dla statusu końca gry
    const [speed, setSpeed] = useState(100);

    useEffect(() => {
        const handleScoreUpdate = (event) => {
            if (event.data.type === 'scoreUpdate') {
                setScore(event.data.score);
            } else if (event.data.type === 'gameOver') {
                setIsGameOver(true);
            }
        };

        window.addEventListener('message', handleScoreUpdate);

        return () => {
            window.removeEventListener('message', handleScoreUpdate);
        };
    }, []);

    const startGame = () => {
        const iframe = document.querySelector('.game-frame').contentWindow;
        iframe.postMessage({ type: 'gameStart', speed }, '*');
        setIsGameStarted(true);
        setIsGameOver(false); // Ukryjemy "Game Over" po rozpoczęciu gry
    };

    const resetGame = () => {
        const iframe = document.querySelector('.game-frame').contentWindow;
        iframe.postMessage('gameReset', '*');
        setScore(0);
        setIsGameStarted(false);
        setIsGameOver(false); // Ukryjemy "Game Over" po resecie
    };

    useEffect(() => {
        const handleKeyPress = (event) => {
            const iframe = document.querySelector('.game-frame').contentWindow;
            iframe.postMessage({ type: 'keyPress', key: event.key }, '*');
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
            window.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    const handleSpeedChange = (event) => {
        setSpeed(Number(event.target.value));
    };

    return (
        <div className="app-container">
            <div className="gui-overlay">
                <h1>React.js test</h1>
                <div className="score-display">Punkty: {score}</div>

                <button onClick={startGame} disabled={isGameStarted}>Start Gry</button>
                <button onClick={resetGame}>Resetuj Grę</button>

                <div className="difficulty-control">
                    <label htmlFor="speed">Poziom trudności:</label>
                    <select id="speed" value={speed} onChange={handleSpeedChange}>
                        <option value="200">Łatwy</option>
                        <option value="100">Średni</option>
                        <option value="50">Trudny</option>
                    </select>
                </div>
            </div>
            <div className={`game-over-message ${isGameOver ? 'visible' : ''}`}>
                Game Over
            </div>
            <iframe
                src="static_game/index.html"
                title="Snake Game"
                className="game-frame"
            ></iframe>
        </div>
    );
}

export default App;
