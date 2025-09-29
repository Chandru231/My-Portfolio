import React, { useEffect, useRef, useState } from "react";
import "./App.css";

const WIDTH = 600;
const HEIGHT = 400;
const PADDLE_HEIGHT = 80;
const PADDLE_WIDTH = 10;
const BALL_SIZE = 12;
const WIN_SCORE = 3;

function App() {
  const canvasRef = useRef(null);
  const [score, setScore] = useState({ player: 0, comp: 0 });
  const [playerName, setPlayerName] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [step, setStep] = useState("intro");
  const [controlType, setControlType] = useState(null);
  const [difficulty, setDifficulty] = useState(null);
  const [winner, setWinner] = useState(null);
  const [isRunning, setIsRunning] = useState(true);

  const playerY = useRef(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const compY = useRef(HEIGHT / 2 - PADDLE_HEIGHT / 2);
  const ball = useRef({ x: WIDTH / 2, y: HEIGHT / 2, dx: 2, dy: 2 });

  const speeds = { easy: 2, medium: 3, hard: 5 };

  const generateId = (name) =>
    name.toUpperCase().slice(0, 3) + "-" + Math.floor(Math.random() * 1000);

  // Keyboard controls
  useEffect(() => {
    if (controlType !== "keyboard" || !isRunning) return;
    const handleKey = (e) => {
      if (e.key === "w") playerY.current = Math.max(0, playerY.current - 20);
      if (e.key === "s")
        playerY.current = Math.min(HEIGHT - PADDLE_HEIGHT, playerY.current + 20);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [controlType, isRunning]);

  // Mouse controls
  useEffect(() => {
    if (controlType !== "mouse" || !isRunning) return;
    const handleMouse = (e) => {
      const rect = canvasRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top - PADDLE_HEIGHT / 2;
      playerY.current = Math.max(0, Math.min(mouseY, HEIGHT - PADDLE_HEIGHT));
    };
    window.addEventListener("mousemove", handleMouse);
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [controlType, isRunning]);

  // Game loop
  useEffect(() => {
    if (step !== "game" || winner || !isRunning) return;
    const ctx = canvasRef.current.getContext("2d");
    let animationId;

    const loop = () => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      // Move ball
      ball.current.x += ball.current.dx;
      ball.current.y += ball.current.dy;

      // Bounce walls
      if (ball.current.y <= 0 || ball.current.y >= HEIGHT - BALL_SIZE)
        ball.current.dy *= -1;

      // Player collision
      if (
        ball.current.x <= PADDLE_WIDTH &&
        ball.current.y >= playerY.current &&
        ball.current.y <= playerY.current + PADDLE_HEIGHT
      )
        ball.current.dx *= -1;

      // Comp collision
      if (
        ball.current.x >= WIDTH - PADDLE_WIDTH - BALL_SIZE &&
        ball.current.y >= compY.current &&
        ball.current.y <= compY.current + PADDLE_HEIGHT
      )
        ball.current.dx *= -1;

      // Scoring
      if (ball.current.x < 0) {
        setScore((s) => {
          const newScore = { ...s, comp: s.comp + 1 };
          checkWinner(newScore);
          return newScore;
        });
        resetBall();
      }
      if (ball.current.x > WIDTH) {
        setScore((s) => {
          const newScore = { ...s, player: s.player + 1 };
          checkWinner(newScore);
          return newScore;
        });
        resetBall(true);
      }

      // Computer AI
      if (ball.current.y > compY.current + PADDLE_HEIGHT / 2)
        compY.current = Math.min(compY.current + speeds[difficulty], HEIGHT - PADDLE_HEIGHT);
      else if (ball.current.y < compY.current + PADDLE_HEIGHT / 2)
        compY.current = Math.max(compY.current - speeds[difficulty], 0);

      // Draw paddles
      ctx.shadowBlur = 15;
      ctx.shadowColor = "#0ff";
      ctx.fillStyle = "#00ffff";
      ctx.fillRect(0, playerY.current, PADDLE_WIDTH, PADDLE_HEIGHT);
      ctx.fillStyle = "#ff00ff";
      ctx.fillRect(WIDTH - PADDLE_WIDTH, compY.current, PADDLE_WIDTH, PADDLE_HEIGHT);

      // Draw ball
      ctx.shadowColor = "#fff";
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.arc(ball.current.x, ball.current.y, BALL_SIZE / 2, 0, Math.PI * 2);
      ctx.fill();

      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [step, difficulty, winner, isRunning]);

  const resetBall = (toLeft = false) => {
    ball.current = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      dx: toLeft ? -speeds[difficulty] : speeds[difficulty],
      dy: speeds[difficulty],
    };
  };

  const checkWinner = (s) => {
    if (s.player >= WIN_SCORE) setWinner("player");
    else if (s.comp >= WIN_SCORE) setWinner("comp");
  };

  const handleStart = () => {
    if (!playerName.trim()) return;
    setPlayerId(generateId(playerName));
    setStep("difficulty");
  };

  const restart = () => {
    setScore({ player: 0, comp: 0 });
    setWinner(null);
    resetBall();
    setIsRunning(true);
  };

  return (
    <div className="app">
      {step === "intro" && (
        <div className="menu">
          <h1>🏓 Pong Game</h1>
          <input
            type="text"
            placeholder="Enter your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button onClick={handleStart}>Start</button>
        </div>
      )}

      {step === "difficulty" && (
        <div className="menu">
          <h2>Welcome {playerName} 👋</h2>
          <p>Your ID: <strong>{playerId}</strong></p>
          <h3>Select Difficulty</h3>
          <button onClick={() => { setDifficulty("easy"); setStep("control"); }}>🟢 Easy</button>
          <button onClick={() => { setDifficulty("medium"); setStep("control"); }}>🟡 Medium</button>
          <button onClick={() => { setDifficulty("hard"); setStep("control"); }}>🔴 Hard</button>
        </div>
      )}

      {step === "control" && (
        <div className="menu">
          <h3>Choose Control</h3>
          <button onClick={() => { setControlType("keyboard"); setStep("game"); }}>⌨ Keyboard (W/S)</button>
          <button onClick={() => { setControlType("mouse"); setStep("game"); }}>🖱 Mouse</button>
        </div>
      )}

      {step === "game" && (
        <div className="game-container">
          <h1 className="glow">🏓 Pong Game</h1>
          <p className="scoreboard">
            <span>{playerName} ({playerId}) 🧍: {score.player}</span>
            <span>🤖 Computer: {score.comp}</span>
          </p>

          <canvas ref={canvasRef} width={WIDTH} height={HEIGHT} className="game" />

          <div className="controls">
            <button onClick={() => setIsRunning(!isRunning)}>
              {isRunning ? "⏸ Stop" : "▶ Start"}
            </button>
            <button onClick={restart}>🔄 Restart</button>
          </div>

          {winner && (
            <div className="popup">
              <h2>{winner === "player" ? "🎉 You Win!" : "😢 You Lose!"}</h2>
              <button onClick={restart}>Play Again</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
