// src/components/Game/GameEnd.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const GameEnd = () => {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    const fetchGame = async () => {
      try {
        const response = await axios.get(`/api/games/${id}`);
        setGame(response.data);
      } catch (error) {
        console.error('Error fetching game:', error);
      }
    };

    fetchGame();
  }, [id]);

  if (!game) return <p>Loading...</p>;

  return (
    <div className="game-end">
      <h2>Game Over</h2>
      <p>Game ID: {game._id}</p>
      <p>Owner: {game.owner.username}</p>
      <p>Scores:</p>
      <ul>
        {game.scores.map((score) => (
          <li key={score.user._id}>
            {score.user.username}: {score.score}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GameEnd;
