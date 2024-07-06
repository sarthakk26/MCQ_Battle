import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../../assets/styles/GameLobby.css';

const GameLobby = () => {
  const { gameId } = useParams();
  const [game, setGame] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    const fetchGameDetails = async () => {
      if (!gameId) {
        setError('Game ID is missing');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.message || 'Failed to fetch game details');
          return;
        }

        const data = await response.json();
        setGame(data);
        setParticipants(data.participants);
        setIsOwner(data.owner._id === localStorage.getItem('userId'));
      } catch (error) {
        setError('Error fetching game details');
      } finally {
        setLoading(false);
      }
    };

    fetchGameDetails();

    // Event listeners for socket.io
    socket.emit('joinGame', gameId);

    socket.on('gameUpdated', (updatedGame) => {
      setGame(updatedGame);
      setParticipants(updatedGame.participants);
      setIsOwner(updatedGame.owner._id === localStorage.getItem('userId'));
    });

    socket.on('gameStarted', () => {
      navigate(`/game/${gameId}/play`);
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, navigate]);

  const handleStartGame = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/games/${gameId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Failed to start game:', data);
        return;
      }

      // Navigate to game play screen upon successful game start
      navigate(`/game/${gameId}/play`);

    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="game-lobby">
      <h2>Game Lobby: {game?.owner?.username}'s Game</h2>
      <p>Status: {game?.status}</p>
      <p>Participants:</p>
      <ul>
        {participants.map(participant => (
          <li key={participant._id}>{participant.username}</li>
        ))}
      </ul>
      {isOwner && game.status === 'waiting' && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
    </div>
  );
};

export default GameLobby;
