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
  const [joinRequests, setJoinRequests] = useState([]);
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

    const userId = localStorage.getItem('userId');
    socket.emit('joinGame', { gameId, userId });

    socket.on('playerJoined', (updatedGame) => {
      setGame(updatedGame);
      setParticipants(updatedGame.participants);
      setIsOwner(updatedGame.owner._id === localStorage.getItem('userId'));
    });

    socket.on('gameStarted', () => {
      navigate(`/game/${gameId}/play`);
    });

    socket.on('joinRequestVal', ({ gameId, userId, socketId, username }) => {
      setJoinRequests((prevRequests) => [...prevRequests, { gameId, userId, socketId, username }]);
    });

    socket.on('gameDeleted', (message) => {
      alert(message.message);
      navigate('/dashboard');
    });

    return () => {
      socket.disconnect();
    };
  }, [gameId, navigate]);

  const handleJoinRequest = (userId, accept, socketId) => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });
    socket.emit('respondToJoinRequest', { gameId, userId, accept, socketId });
    setJoinRequests((prevRequests) => prevRequests.filter(request => request.userId !== userId));
  };

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

      navigate(`/game/${gameId}/play`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="bg">
      <div className="lobby-container">
        <div className="game-lobby">
          <h1>MCQ Battle</h1>
          <h2>Game Lobby </h2>
          <p>{game?.owner?.username}'s Game</p>
          <p>Mode: {game.gameMode}</p>
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
        {isOwner && joinRequests.length > 0 && (
          <div className="join-requests">
            <h3>Join Requests</h3>
            <ul>
              {joinRequests.map(request => (
                <li key={request.userId}>
                  <span>{request.username} wants to join.</span>
                  <button onClick={() => handleJoinRequest(request.userId, true, request.socketId)}>Accept</button>
                  <button onClick={() => handleJoinRequest(request.userId, false, request.socketId)}>Decline</button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
