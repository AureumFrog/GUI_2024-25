// Leaderboard.js
import React, { useEffect, useState } from 'react';
import './Leaderboard.css';

const Leaderboard = ({ records, isCleared }) => {
    const [displayRecords, setDisplayRecords] = useState(records);

    useEffect(() => {
        if (isCleared) {
            // Uruchamiamy animację zanikania
            setTimeout(() => {
                setDisplayRecords([]);
            }, 500); // Długość animacji zgodna z CSS
        } else {
            setDisplayRecords(records);
        }
    }, [records, isCleared]);

    return (
        <div className={`leaderboard ${isCleared ? 'leaderboard-cleared' : ''}`}>
            <h2>Tablica Liderów</h2>
            {displayRecords.length > 0 ? (
                <table>
                    <thead>
                    <tr>
                        <th>Nick</th>
                        <th>Punkty</th>
                        <th>Poziom trudności</th>
                    </tr>
                    </thead>
                    <tbody>
                    {displayRecords.map((record, index) => (
                        <tr key={index}>
                            <td>{record.nickname}</td>
                            <td>{record.score}</td>
                            <td>{record.difficulty}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            ) : (
                <p>Brak rekordów</p>
            )}
        </div>
    );
};

export default Leaderboard;
