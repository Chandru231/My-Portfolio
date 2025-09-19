const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");

const box = 20;
let snake, food, score, d, game;

function initGame() {
  snake = [{ x: 9 * box, y: 10 * box }];
  food = {
    x: Math.floor(Math.random() * 20) * box,
    y: Math.floor(Math.random() * 20) * box
  };
  score = 0;
  d = null;
  scoreEl.textContent = "Score: " + score;
  if (game) clearInterval(game);
  game = setInterval(draw, 150);
}

document.addEventListener("keydown", direction);
function direction(event) {
  if (event.key === "ArrowLeft" && d !== "RIGHT") d = "LEFT";
  else if (event.key === "ArrowUp" && d !== "DOWN") d = "UP";
  else if (event.key === "ArrowRight" && d !== "LEFT") d = "RIGHT";
  else if (event.key === "ArrowDown" && d !== "UP") d = "DOWN";
}

function setDir(dir) {
  if (dir === "LEFT" && d !== "RIGHT") d = "LEFT";
  if (dir === "UP" && d !== "DOWN") d = "UP";
  if (dir === "RIGHT" && d !== "LEFT") d = "RIGHT";
  if (dir === "DOWN" && d !== "UP") d = "DOWN";
}

function draw() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw snake
  for (let i = 0; i < snake.length; i++) {
    ctx.fillStyle = i === 0 ? "lime" : "white";
    ctx.fillRect(snake[i].x, snake[i].y, box, box);
  }

  // draw food
  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (d === "LEFT") snakeX -= box;
  if (d === "UP") snakeY -= box;
  if (d === "RIGHT") snakeX += box;
  if (d === "DOWN") snakeY += box;

  // if snake eats food
  if (snakeX === food.x && snakeY === food.y) {
    score++;
    scoreEl.textContent = "Score: " + score;
    food = {
      x: Math.floor(Math.random() * 20) * box,
      y: Math.floor(Math.random() * 20) * box
    };
  } else {
    snake.pop(); // remove tail
  }

  let newHead = { x: snakeX, y: snakeY };

  // game over only if snake goes outside
  if (
    snakeX < 0 || snakeX >= canvas.width ||
    snakeY < 0 || snakeY >= canvas.height
  ) {
    clearInterval(game);
    alert("Game Over! Final Score: " + score);
  }

  snake.unshift(newHead);
}

function restartGame() {
  initGame();
}

// start first game
initGame();
