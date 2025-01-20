// src/App.js
import React, { useState, useEffect } from 'react';
import GameScreen from './components/GameScreen';
import WelcomeScreen from './components/WelcomeScreen';
import GameScreenVsRabbit from './components/GameScreenVsRabbit'; // Nowy plik
import './App.css';

function App() {
    const [currentScreen, setCurrentScreen] = useState('welcome');
    const [nickname, setNickname] = useState('');
    const [gameSpeed, setGameSpeed] = useState('łatwy');
    const [records, setRecords] = useState([]);

    useEffect(() => {
        const savedRecords = localStorage.getItem('snakeGameRecords');
        if (savedRecords) {
            try {
                const parsedRecords = JSON.parse(savedRecords);
                if (Array.isArray(parsedRecords)) {
                    setRecords(parsedRecords);
                } else {
                    console.error('Zapisane rekordy nie są tablicą:', parsedRecords);
                    setRecords([]);
                }
            } catch (error) {
                console.error('Błąd przy parsowaniu rekordów z localStorage:', error);
                setRecords([]);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('snakeGameRecords', JSON.stringify(records));
    }, [records]);

    const handleStartGame = () => {
        setCurrentScreen('game');
    };

    const handleStartRabbitMode = () => {
        setCurrentScreen('gameRabbit'); // <-- Nowy typ ekranu
    };

    const handleBackToMenu = (finalScore, difficulty) => {
        if (finalScore !== null && finalScore >= 0) {
            updateRecords(finalScore, difficulty);
        }
        setCurrentScreen('welcome');
    };

    const handleGameOver = (finalScore, difficulty) => {
        if (finalScore !== null && finalScore >= 0) {
            updateRecords(finalScore, difficulty);
        }
    };

    const updateRecords = (finalScore, difficulty) => {
        // Stary tryb jednoosobowy
        const validPrevRecords = Array.isArray(records) ? records : [];
        const newRecord = { nickname, score: finalScore, difficulty };

        const recordExists = validPrevRecords.some(
            (record) =>
                record.nickname === nickname &&
                record.score === finalScore &&
                record.difficulty === difficulty
        );

        if (recordExists) {
            return validPrevRecords;
        }

        const updatedRecords = [
            ...validPrevRecords,
            newRecord,
        ]
            .sort((a, b) => {
                const difficultyMultiplier = { 'łatwy': 1, 'średni': 2, 'trudny': 3 };
                const aTotal = a.score * difficultyMultiplier[a.difficulty];
                const bTotal = b.score * difficultyMultiplier[b.difficulty];
                return bTotal - aTotal;
            })
            .slice(0, 10);
        setRecords(updatedRecords);
    };

    const handleDifficultySelect = (level) => {
        setGameSpeed(level);
    };

    const handleClearRecords = () => {
        setRecords([]);
    };

    return (
        <div className="app">
            {currentScreen === 'welcome' && (
                <WelcomeScreen
                    nickname={nickname}
                    onNicknameChange={setNickname}
                    onDifficultySelect={handleDifficultySelect}
                    selectedDifficulty={gameSpeed}
                    onStartGame={handleStartGame}
                    onStartRabbitMode={handleStartRabbitMode} // <-- Nowy props
                    records={records}
                    onClearRecords={handleClearRecords}
                />
            )}

            {currentScreen === 'game' && (
                <GameScreen
                    nickname={nickname}
                    difficulty={gameSpeed}
                    onBack={handleBackToMenu}
                    onGameOver={handleGameOver}
                    records={records}
                />
            )}

            {/* Nowy ekran trybu Wąż vs Królik */}
            {currentScreen === 'gameRabbit' && (
                <GameScreenVsRabbit
                    nickname={nickname}
                    difficulty={gameSpeed}
                    onBack={() => setCurrentScreen('welcome')}
                    // Nie zapisujemy rekordów do Leaderboard
                />
            )}
        </div>
    );
}

export default App;
