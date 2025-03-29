import React, { useRef, useEffect, useState } from "react";

const LEVEL_COLORS = ["#FF5733", "#33FF57", "#3357FF", "#FF33A1", "#FFD700"];

const Breakout = () => {
  const canvasRef = useRef(null);
  const gameLoopRef = useRef(null);
  const bricksRef = useRef([]);
  const paddleXRef = useRef(0);
  const paddleDxRef = useRef(0);
  const ballRef = useRef({ x: 0, y: 0, dx: 4, dy: -4 });

  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [allBricksDestroyed, setAllBricksDestroyed] = useState(false);

  useEffect(() => {
    if (!gameStarted) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      paddleXRef.current = (canvas.width - 100) / 2;
    }

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const paddle = { width: 150, height: 10, speed: 7 };
    const ball = ballRef.current;
    ball.x = canvas.width / 2;
    ball.y = canvas.height - 30;
    ball.dx = 4 + level * 0.5;
    ball.dy = -4 - level * 0.5;

    if (bricksRef.current.length === 0) {
      const brickRowCount = 5 + (level - 1) * 2;
      const brickColumnCount = 17;
      const brickWidth = 75;
      const brickHeight = 20;
      const brickPadding = 10;
      const brickOffsetTop = 30;
      const brickOffsetLeft = 30;

      bricksRef.current = Array.from({ length: brickColumnCount }, (_, c) =>
        Array.from({ length: brickRowCount }, (_, r) => ({
          x: c * (brickWidth + brickPadding) + brickOffsetLeft,
          y: r * (brickHeight + brickPadding) + brickOffsetTop,
          status: 1,
        }))
      );
    }

    function drawBricks() {
      let bricksLeft = 0;
      bricksRef.current.forEach((column) =>
        column.forEach((brick) => {
          if (brick.status === 1) {
            bricksLeft++;
            ctx.fillStyle = LEVEL_COLORS[level - 1];
            ctx.fillRect(brick.x, brick.y, 75, 20);
          }
        })
      );
      if (bricksLeft === 0) {
        setAllBricksDestroyed(true);
      }
    }

    function drawPaddle() {
      ctx.fillStyle = "#0095DD";
      ctx.fillRect(paddleXRef.current, canvas.height - paddle.height - 10, paddle.width, paddle.height);
    }

    function drawBall() {
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
      ctx.fillStyle = "#0095DD";
      ctx.fill();
      ctx.closePath();
    }

    function drawScore() {
      ctx.font = "20px Arial";
      ctx.fillStyle = "white";
      ctx.fillText(`Score: ${score} | Level: ${level}`, 20, 30);
    }

    function collisionDetection() {
      bricksRef.current.forEach((column) =>
        column.forEach((brick) => {
          if (brick.status === 1) {
            if (
              ball.x > brick.x &&
              ball.x < brick.x + 75 &&
              ball.y > brick.y &&
              ball.y < brick.y + 20
            ) {
              ball.dy = -ball.dy;
              ball.y += ball.dy * 1.1;
              brick.status = 0;
              setScore((prev) => prev + 1);
            }
          }
        })
      );
    }

    function update() {
      ball.x += ball.dx;
      ball.y += ball.dy;

      paddleXRef.current = Math.max(0, Math.min(canvas.width - 100, paddleXRef.current + paddleDxRef.current));

      if (ball.x + ball.dx > canvas.width - 7 || ball.x + ball.dx < 7) {
        ball.dx = -ball.dx;
      }

      if (ball.y + ball.dy < 7) {
        ball.dy = Math.abs(ball.dy);
      } else if (ball.y + ball.dy > canvas.height - 20) {
        if (ball.x > paddleXRef.current && ball.x < paddleXRef.current + 100) {
          ball.dy = -ball.dy;
          let hitPoint = (ball.x - paddleXRef.current) / 100;
          ball.dx = (hitPoint - 0.5) * 8;
        } else if (ball.y + ball.dy > canvas.height) {
          setGameOver(true);
          return;
        }
      }
      collisionDetection();
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawBricks();
      drawPaddle();
      drawBall();
      drawScore();
      update();

      if (!gameOver && !allBricksDestroyed) {
        gameLoopRef.current = requestAnimationFrame(draw);
      }
    }

    draw();

    function handleKeyDown(e) {
      if (e.key === "ArrowLeft") paddleDxRef.current = -paddle.speed;
      if (e.key === "ArrowRight") paddleDxRef.current = paddle.speed;
    }

    function handleKeyUp(e) {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") paddleDxRef.current = 0;
    }

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      cancelAnimationFrame(gameLoopRef.current);
    };
  }, [gameStarted, gameOver, level, allBricksDestroyed]);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", width: "100vw", backgroundColor: "#000" }}>
      {!gameStarted ? (
        <button onClick={() => setGameStarted(true)} style={{ fontSize: "24px", padding: "15px 30px", backgroundColor: "#0095DD", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Start Game
        </button>
      ) : (
        <>
          <canvas ref={canvasRef} style={{ position: "absolute", top: "0", left: "0", width: "100vw", height: "100vh", display: "block" }}></canvas>
          {gameOver && (
            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", textAlign: "center", background: "rgba(0,0,0,0.8)", padding: "20px", borderRadius: "10px" }}>
              <h3 style={{ color: "white" }}>Game Over! Final Score: {score}</h3>
              <button
                onClick={() => {
                  setGameOver(false);
                  setGameStarted(false);
                  setScore(0);
                  bricksRef.current = [];
                  ballRef.current = { x: 0, y: 0, dx: 4, dy: -4 };
                }}
                style={{ fontSize: "20px", padding: "10px 20px", backgroundColor: "#ff0000", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
              >
                Retry
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Breakout;
