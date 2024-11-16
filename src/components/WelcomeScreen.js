// WelcomeScreen.js
import React, { useState } from 'react';
import Leaderboard from './Leaderboard';
import './WelcomeScreen.css';

const WelcomeScreen = ({
                           nickname,
                           onNicknameChange,
                           onDifficultySelect,
                           selectedDifficulty,
                           onStartGame,
                           records,
                           onClearRecords,
                       }) => {
    const difficulties = ['łatwy', 'średni', 'trudny'];
    const [displayCleared, setDisplayCleared] = useState(false);

    const handleClearRecords = () => {
        setDisplayCleared(true);
        setTimeout(() => {
            onClearRecords();
            setDisplayCleared(false);
        }, 500); // Długość animacji
    };

    return (
        <div className="welcome-screen">
            <h1>Gra w Węża</h1>
            <div className="difficulty-selection">
                {difficulties.map((level) => (
                    <button
                        key={level}
                        className={`difficulty-button ${selectedDifficulty === level ? 'selected' : ''}`}
                        onClick={() => onDifficultySelect(level)}
                    >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                ))}
            </div>
            <div className="nickname-form">
                <label htmlFor="nickname-input">Wpisz swój nick</label>
                <input
                    id="nickname-input"
                    type="text"
                    placeholder="Wpisz swój nick"
                    value={nickname}
                    onChange={(e) => onNicknameChange(e.target.value)}
                    className="nickname-input"
                />
            </div>
            <button
                onClick={onStartGame}
                className={`play-button ${!nickname.trim() ? 'disabled' : ''}`}
                disabled={!nickname.trim()}
            >
                Graj
            </button>
            <Leaderboard records={records} isCleared={displayCleared} />
            <button className="clear-button" onClick={handleClearRecords}>
                Wyczyść tablicę
            </button>
        </div>
    );
};

export default WelcomeScreen;
