import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import '../../assets/styles/GameEnd.css';

const GameEnd = () => {
  const { gameId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [gameMode, setGameMode] = useState("");

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    const userId = localStorage.getItem('userId');

    socket.emit('joinGame', { gameId, userId });

    const fetchGameMode = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setGameMode(data.gameMode);
        } else {
          console.error("Failed to fetch game mode");
        }
      } catch (error) {
        console.error("Error fetching game mode:", error);
      }
    };

    fetchGameMode();

    // Request leaderboard once joined
    socket.emit('requestLeaderboard', gameId);

    socket.on('updateLeaderboard', (leaderboard) => {
      console.log('Leaderboard:', leaderboard);
      setLeaderboard(leaderboard);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  return (
    <div className="bg">
      <div className="game-end">
        <h2>Game Over</h2>
        <h3>Leaderboard</h3>
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Username</th>
              <th>Score</th>
              {gameMode !== 'fastest' && <th>Time Taken</th>}
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{entry.username}</td>
                <td>{entry.score}</td>
                {gameMode !== 'fastest' && <td>{entry.timeTaken ? formatTime(entry.timeTaken) : 'In progress...'}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameEnd;
