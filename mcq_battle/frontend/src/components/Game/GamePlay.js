import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import '../../assets/styles/GamePlay.css';

const Gameplay = () => {
  const { gameId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    if (gameId) {
      // Join game room
      socket.emit('joinGame', gameId);
      
      // Fetch game details to determine if the current user is the owner
      const fetchGameDetails = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/games/${gameId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) {
            const data = await response.json();
            console.error('Failed to fetch game details:', data.message);
            setLoading(false);
            return;
          }

          const data = await response.json();
          setOwner(data.owner === localStorage.getItem('username'));
          setLoading(false);
        } catch (error) {
          console.error('Error fetching game details:', error);
          setLoading(false);
        }
      };

      fetchGameDetails(); // Call fetchGameDetails inside useEffect

      // Handle incoming question event
      socket.on('question', (receivedQuestion) => {
        setQuestion(receivedQuestion);
        setAnswer('');
      });

      // Handle game ended event
      socket.on('gameEnded', () => {
        alert('The game has ended');
        navigate('/dashboard');
      });

      // Clean up event listeners on component unmount
      return () => {
        socket.off('question');
        socket.off('gameEnded');
      };
    }

    // Clean up socket on component unmount
    return () => {
      socket.disconnect();
    };

  }, [gameId, navigate]);

  const handleAnswerSubmit = async () => {
    if (answer && question) {
      try {
        const response = await fetch(`http://localhost:5000/api/games/${gameId}/answer`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            answer,
            questionId: question._id // Send the question ID
          })
        });
  
        if (!response.ok) {
          const data = await response.json();
          console.error('Error submitting answer:', data.message);
          return;
        }
  
        const result = await response.json();
        if ( result.nextQuestion) {
          setQuestion(result.nextQuestion); // Update state with the next question
          setAnswer(''); // Clear answer input
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
      }
    }
  };
  

  return (
    <div className="gameplay">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>Gameplay</h2>
          {console.log(question)}
          {owner && (
            <button onClick={() => navigate(`/gameLobby/${gameId}`)}>End Game</button>
          )}
          {question && (
            <div className="question">
              
              <h3>Q:{question.question}</h3>
              <ul>
                {question.options.map((option, index) => (
                  <li key={index}>
                    <label>
                      <input
                        type="radio"
                        value={option}
                        checked={answer === option}
                        onChange={() => setAnswer(option)}
                      />
                      {option}
                    </label>
                  </li>
                ))}
              </ul>
              <button onClick={handleAnswerSubmit}>Submit Answer</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Gameplay;
