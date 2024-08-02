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
  const [timer, setTimer] = useState(600); // 10 minutes in seconds
  const [scores, setScores] = useState([]);
  const [gameMode, setGameMode] = useState("");
  const [gameStatus, setGameStatus] = useState("waiting");
  const navigate = useNavigate();
  const intervalRef = useRef(null);
  const socket = useRef(null);
  
  useEffect(() => {
    socket.current = io("http://localhost:5000", {
      withCredentials: true,
    });

    const userId = localStorage.getItem('userId');

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
        setGameMode(data.gameMode || "");
        setGameStatus(data.status || "waiting");
        setLoading(false);

        // Start the timer if the game is active
        if (data.status === "active") {
          startTimer();
        }
      } catch (error) {
        console.error("Error fetching game details:", error);
        setLoading(false);
      }
    };

    if (gameId) {
      socket.current.emit("joinGame", { gameId, userId });
      fetchGameDetails();

      socket.current.on("question", (receivedQuestion) => {
        setQuestion(receivedQuestion);
        setAnswer("");
      });

      socket.current.on("scoreUpdate", (updatedScores) => {
        setScores(updatedScores);
      });

      socket.current.on("gameStarted", ({ question, scores }) => {
        setQuestion(question);
        setScores(scores);
        setGameStatus("active");
        startTimer();
      });

      socket.current.on("gameEnded", () => {
        setGameStatus("finished");
        navigate(`/game/${gameId}/end`);
      });

      return () => {
        socket.current.off("question");
        socket.current.off("scoreUpdate");
        socket.current.off("gameStarted");
        socket.current.off("gameEnded");
        clearInterval(intervalRef.current);
      };
    }

    return () => {
      socket.current.disconnect();
    };
  }, [gameId, navigate]);

  const startTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer === 0) {
          clearInterval(intervalRef.current);
          endGame();
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);
  };

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
      navigate(`/game/${gameId}/end`);
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
              questionId: question._id,
            }),
          }
        );

        if (!response.ok) {
          const data = await response.json();
          console.error("Error submitting answer:", data.message);
          return;
        }
        const result = await response.json();
        if (result.nextQuestion) {
          setQuestion(result.nextQuestion);
          setAnswer("");
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        } else {
          endGame();
        }
        socket.current.emit("requestLeaderboard", gameId);
      } catch (error) {
        console.error("Error submitting answer:", error);
      }
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  return (
    <div className="bg">
      <div className="scores">
        <h2>Scores:</h2>
        <ul>
          {scores.map(({ user, score }) => (
            <li key={user?._id}>
              {user?.username || "Unknown"}: {score}
            </li>
          ))}
        </ul>
      </div>
      <div className="gameplay">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="question-content">
              <p>
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
              {question && (
                <div>
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
            </div>
            <div className="timer">
              <p>Time Remaining: {formatTime(timer)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Gameplay;
