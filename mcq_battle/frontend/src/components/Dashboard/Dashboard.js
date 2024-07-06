import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../assets/styles/Dashboard.css';

const Dashboard = () => {
  const [games, setGames] = useState([]);
  const [creatingGame, setCreatingGame] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/games/waiting', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setGames(data);
      } else {
        console.error('Failed to fetch games:', data.message);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
    }
  };

  const handleCreateGame = async () => {
    setCreatingGame(true);
    try {
      const response = await fetch('http://localhost:5000/api/games', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/game/${data.game._id}`); // Update to navigate to the correct route
      } else {
        console.error('Failed to create game:', data.message);
      }
    } catch (error) {
      console.error('Error creating game:', error);
    }
    setCreatingGame(false);
  };

  const handleJoinGame = async (gameId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/games/${gameId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        navigate(`/game/${data.game._id}`); // Update to navigate to the correct route
      } else {
        console.error('Failed to join game:', data.message);
      }
    } catch (error) {
      console.error('Error joining game:', error);
    }
  };

  return (
    <div className="dashboard">
      <h2>Available Games</h2>
      {games.length > 0 ? (
        <ul className="game-list">
          {games.map((game) => (
            <li key={game._id}>
              <div className="game-info">
                <span>Game: {game.ownerName}</span>
                <span>Participants: {game.participants.length}</span>
              </div>
              <button onClick={() => handleJoinGame(game._id)}>Join Game</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No available games at the moment.</p>
      )}
      <button 
        onClick={handleCreateGame} 
        disabled={creatingGame} 
        className="create-game-button"
      >
        {creatingGame ? 'Creating Game...' : 'Create New Game'}
      </button>
    </div>
  );
};

export default Dashboard;