import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import '../../assets/styles/GameEnd.css';

const GameEnd = () => {
  const { gameId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  //const [remainingTime, setRemainingTime] = useState(0);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    socket.emit('joinGame', gameId);

    // Request leaderboard once joined
    socket.emit('requestLeaderboard', gameId);

    socket.on('updateLeaderboard', (leaderboard) => {
      setLeaderboard(leaderboard);
    });
    
    return () => {
      socket.disconnect();
    };
  }, [gameId]);

  return (
    <div className="game-end">
      <h2>Game Over</h2>
      <h3>Leaderboard</h3>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>Score</th>
            <th>Time Taken</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{entry.username}</td>
              <td>{entry.score}</td>
              <td>{entry.timeTaken ? formatTime(entry.timeTaken) : 'In progress...'}</td>
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GameEnd;
