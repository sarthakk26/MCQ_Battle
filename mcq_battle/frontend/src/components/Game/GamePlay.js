import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import "../../assets/styles/GamePlay.css";

const Gameplay = () => {
  const { gameId } = useParams();
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState("");
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [owner, setOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [timer, setTimer] = useState(60); // 10 minutes in seconds
  const [scores, setScores] = useState([]);
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    const fetchGameDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/api/games/${gameId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        if (!response.ok) {
          const data = await response.json();
          console.error("Failed to fetch game details:", data.message);
          setLoading(false);
          return;
        }

        const data = await response.json();
        setOwner(data.owner === localStorage.getItem("username"));
        setQuestions(data.questions || []);
        setCurrentQuestionIndex(data.currentQuestionIndex || 0);
        setLoading(false);

        // Start the timer if the game is active
        if (data.status === "active") {
          startTimer(); // Start the countdown
        }
      } catch (error) {
        console.error("Error fetching game details:", error);
        setLoading(false);
      }
    };

    if (gameId) {
      // Join game room
      socket.current.emit("joinGame", gameId);

      fetchGameDetails(); // Call fetchGameDetails inside useEffect

      // Handle incoming question event
      socket.current.on("question", (receivedQuestion) => {
        setQuestion(receivedQuestion);
        setAnswer("");
      });

      // Handle score update event
      socket.current.on("scoreUpdate", (updatedScores) => {
        setScores(updatedScores);
      });

      // Handle game started event
      socket.current.on("gameStarted", ({ question, scores }) => {
        setQuestion(question);
        setScores(scores);
        startTimer(); // Start the timer when the game starts
      });

  
      // Clean up event listeners on component unmount
      return () => {
        socket.current.off("question");
        socket.current.off("scoreUpdate");
        socket.current.off("gameStarted");
        socket.current.off("gameEnded");
        clearInterval(intervalRef.current); // Clear interval on unmount
      };
    }

    // Clean up socket on component unmount
    return () => {
      socket.current.disconnect();
    };
  }, [gameId, navigate]);

  // Function to start the timer
  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current); // Clear any existing interval
    }
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(intervalRef.current); // Stop the timer
          endGame(); // End the game when timer reaches zero
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000); // Update timer every second
  };

  // Function to handle ending the game
  const endGame = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/games/${gameId}/end`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Error ending game:", data.message);
        return;
      }
      socket.current.emit("endGame", gameId); // Emit endGame event to the server
      navigate(`/game/${gameId}/end`); // Redirect to game end screen
    } catch (error) {
      console.error("Error ending game:", error);
    }
  };

  const handleAnswerSubmit = async () => {
    if (answer && question) {
      try {
        const response = await fetch(
          `http://localhost:5000/api/games/${gameId}/answer`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              answer,
              questionId: question._id, // Send the question ID
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          console.error("Error submitting answer:", data.message);
          return;
        }
        socket.current.emit("requestLeaderboard", gameId);
        const result = await response.json();
        if (result.nextQuestion) {
          //socket.current.emit("RequestLeaderboard", gameId);
          setQuestion(result.nextQuestion); // Update state with the next question
          setAnswer(""); // Clear answer input
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
          endGame(); // End game if no more questions
        }
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  // Format timer for display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Determine if this is the last question
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="gameplay">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <h2>Gameplay</h2>
          <p>
            Question {currentQuestionIndex + 1} of {questions.length}
          </p>
          {question && (
            <div className="question">
              <h3>Q: {question.question}</h3>
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
              <button onClick={handleAnswerSubmit}>
                {isLastQuestion ? "Submit" : "Submit Answer"}
              </button>
            </div>
          )}
          <div className="timer">
            <p>Time Remaining: {formatTime(timer)}</p>
          </div>
          <div className="scores">
            <h3>Scores:</h3>
            <ul key= "ul">
              {scores.map(({ user, score }) => (
                <li key={user?._id}>
                  {user?.username || "Unknown"}: {score}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Gameplay;
