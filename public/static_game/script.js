let score = 0;
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const gridSize = 20;
let snake = [{ x: gridSize * 5, y: gridSize * 5 }];
let food = getRandomPosition();
let dx = gridSize;
let dy = 0;
let gameInterval;

// Funkcja generująca losowe położenie jedzenia
function getRandomPosition() {
    const maxPos = canvas.width / gridSize;
    return {
        x: Math.floor(Math.random() * maxPos) * gridSize,
        y: Math.floor(Math.random() * maxPos) * gridSize
    };
}

// Aktualizacja punktów i wysyłanie wiadomości do React
function updateScore() {
    window.parent.postMessage({ type: 'scoreUpdate', score }, '*');
}

// Rysowanie jedzenia
function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, gridSize, gridSize);
}

// Rysowanie węża
function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(part => ctx.fillRect(part.x, part.y, gridSize, gridSize));
}

// Aktualizacja pozycji węża
function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        updateScore();
        food = getRandomPosition();
    } else {
        snake.pop();
    }
}

// Sprawdzenie kolizji
function checkCollision() {
    const head = snake[0];
    return (
        head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height ||
        snake.slice(1).some(part => part.x === head.x && part.y === head.y)
    );
}

// Główna pętla gry
function gameLoop() {
    if (checkCollision()) {
        clearInterval(gameInterval);
        window.parent.postMessage({ type: 'gameOver' }, '*'); // Wysyłanie "gameOver" do React
        resetGame();
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawFood();
        moveSnake();
        drawSnake();
    }
}

// Rozpoczęcie gry z parametrem prędkości
function startGame(speed) {
    if (!gameInterval) {
        gameInterval = setInterval(gameLoop, speed);
    }
}

// Resetowanie gry
function resetGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    score = 0;
    updateScore();
    snake = [{ x: gridSize * 5, y: gridSize * 5 }];
    dx = gridSize;
    dy = 0;
    food = getRandomPosition();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Słuchacze do zarządzania z React
window.addEventListener('message', (event) => {
    if (event.data.type === 'gameStart') {
        startGame(event.data.speed);
    } else if (event.data === 'gameReset') {
        resetGame();
    } else if (event.data.type === 'keyPress') {
        handleKeyPress(event.data.key);
    }
});

// Funkcja obsługująca naciśnięcia klawiszy
function handleKeyPress(key) {
    switch (key) {
        case "ArrowUp":
            if (dy === 0) { dx = 0; dy = -gridSize; }
            break;
        case "ArrowDown":
            if (dy === 0) { dx = 0; dy = gridSize; }
            break;
        case "ArrowLeft":
            if (dx === 0) { dx = -gridSize; dy = 0; }
            break;
        case "ArrowRight":
            if (dx === 0) { dx = gridSize; dy = 0; }
            break;
    }
}

// Inicjalizacja rozmiarów canvas
canvas.width = 400;
canvas.height = 400;
updateScore();
