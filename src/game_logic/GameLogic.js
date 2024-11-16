// GameLogic.js
const GameLogic = (() => {
    const gridSize = 20;
    let context;
    let score = 0;
    let snake = [];
    let food = { x: 200, y: 200 };
    let dx = 0;
    let dy = -gridSize;
    let gameInterval;
    let lastFrameTime = 0;
    let gameSpeed = 200; // Domyślna prędkość (ms)

    // Obrazki
    const images = {
        head: { up: new Image(), down: new Image(), left: new Image(), right: new Image() },
        body: { horizontal: new Image(), vertical: new Image(), topleft: new Image(), topright: new Image(), bottomleft: new Image(), bottomright: new Image() },
        tail: { up: new Image(), down: new Image(), left: new Image(), right: new Image() },
        food: new Image(),
    };

    // Funkcja do ładowania obrazków
    function loadImages(callback) {
        const imagePaths = {
            "head.up": "/Graphics/head_up.png",
            "head.down": "/Graphics/head_down.png",
            "head.left": "/Graphics/head_left.png",
            "head.right": "/Graphics/head_right.png",
            "body.horizontal": "/Graphics/body_horizontal.png",
            "body.vertical": "/Graphics/body_vertical.png",
            "body.topleft": "/Graphics/body_topleft.png",
            "body.topright": "/Graphics/body_topright.png",
            "body.bottomleft": "/Graphics/body_bottomleft.png",
            "body.bottomright": "/Graphics/body_bottomright.png",
            "tail.up": "/Graphics/tail_up.png",
            "tail.down": "/Graphics/tail_down.png",
            "tail.left": "/Graphics/tail_left.png",
            "tail.right": "/Graphics/tail_right.png",
            "food": "/Graphics/apple.png",
        };

        let loadedImages = 0;
        const totalImages = Object.keys(imagePaths).length;

        Object.keys(imagePaths).forEach((key) => {
            const keys = key.split('.');
            let target = images;

            keys.forEach((k, i) => {
                if (i === keys.length - 1) {
                    target[k].src = imagePaths[key];
                    target[k].onload = () => {
                        loadedImages++;
                        if (loadedImages === totalImages) {
                            callback(); // Wszystkie obrazki załadowane
                        }
                    };
                    target[k].onerror = () => {
                        console.error(`Nie udało się załadować obrazka: ${imagePaths[key]}`);
                    };
                } else {
                    target = target[k];
                }
            });
        });
    }

    function initialize(ctx, callback) {
        context = ctx;
        loadImages(() => {
            resetGame();
            if (callback) callback();
        });
    }

    function startGame(speed) {
        gameSpeed = speed; // Przypisujemy prędkość gry zgodnie z poziomem trudności
        if (!gameInterval) {
            lastFrameTime = performance.now();
            gameInterval = requestAnimationFrame(gameLoop);
        }
    }

    function resetGame() {
        if (gameInterval) {
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
        }
        score = 0;

        // Ustawienie początkowej pozycji węża
        const centerX = Math.floor((context.canvas.width / gridSize) / 2) * gridSize;
        const centerY = Math.floor((context.canvas.height / gridSize) / 2) * gridSize;

        snake = [
            { x: centerX, y: centerY },
            { x: centerX, y: centerY + gridSize },
        ];

        dx = 0;
        dy = -gridSize;

        food = getRandomFoodPosition();

        draw();
    }

    function handleKeyPress(key) {
        if (key === "ArrowUp" && dy !== gridSize) {
            dx = 0;
            dy = -gridSize;
        } else if (key === "ArrowDown" && dy !== -gridSize) {
            dx = 0;
            dy = gridSize;
        } else if (key === "ArrowLeft" && dx !== gridSize) {
            dx = -gridSize;
            dy = 0;
        } else if (key === "ArrowRight" && dx !== -gridSize) {
            dx = gridSize;
            dy = 0;
        }
    }

    function drawGrid() {
        for (let x = 0; x < context.canvas.width; x += gridSize) {
            for (let y = 0; y < context.canvas.height; y += gridSize) {
                context.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? "#aad751" : "#a2d149";
                context.fillRect(x, y, gridSize, gridSize);
            }
        }
    }

    function drawSnake() {
        const time = Date.now();
        snake.forEach((segment, index) => {
            let img;

            if (index === 0) {
                // Głowa węża - używamy aktualnego kierunku ruchu
                if (dx > 0) img = images.head.right;
                else if (dx < 0) img = images.head.left;
                else if (dy > 0) img = images.head.down;
                else if (dy < 0) img = images.head.up;
            } else if (index === snake.length - 1) {
                // Ogon węża
                const prev = snake[index - 1];
                if (prev.x > segment.x) img = images.tail.left;
                else if (prev.x < segment.x) img = images.tail.right;
                else if (prev.y > segment.y) img = images.tail.up;
                else if (prev.y < segment.y) img = images.tail.down;
            } else {
                // Ciało węża
                const prev = snake[index - 1];
                const next = snake[index + 1];

                if (prev.x === next.x) {
                    img = images.body.vertical;
                } else if (prev.y === next.y) {
                    img = images.body.horizontal;
                } else if ((prev.x < segment.x && next.y < segment.y) || (next.x < segment.x && prev.y < segment.y)) {
                    img = images.body.topleft;
                } else if ((prev.x > segment.x && next.y < segment.y) || (next.x > segment.x && prev.y < segment.y)) {
                    img = images.body.topright;
                } else if ((prev.x < segment.x && next.y > segment.y) || (next.x < segment.x && prev.y > segment.y)) {
                    img = images.body.bottomleft;
                } else if ((prev.x > segment.x && next.y > segment.y) || (next.x > segment.x && prev.y > segment.y)) {
                    img = images.body.bottomright;
                }
            }

            // Dodanie efektu pulsowania dla segmentów węża
            const scale = 1 + 0.1 * Math.sin((time + index * 100) / 200);
            const size = gridSize * scale;
            const offset = (gridSize - size) / 2;

            context.drawImage(img, segment.x + offset, segment.y + offset, size, size);
        });
    }

    function drawFood() {
        context.drawImage(images.food, food.x, food.y, gridSize, gridSize);
    }

    function gameLoop(currentTime) {
        const deltaTime = currentTime - lastFrameTime;

        if (deltaTime >= gameSpeed) {
            lastFrameTime = currentTime;

            const newHead = { x: snake[0].x + dx, y: snake[0].y + dy };

            // Sprawdzenie kolizji
            if (
                newHead.x < 0 ||
                newHead.x >= context.canvas.width ||
                newHead.y < 0 ||
                newHead.y >= context.canvas.height ||
                snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)
            ) {
                cancelAnimationFrame(gameInterval);
                gameInterval = null;
                window.postMessage({ type: "gameOver" }, "*");
                return;
            }

            snake.unshift(newHead);

            // Sprawdzenie, czy wąż zjadł jedzenie
            if (newHead.x === food.x && newHead.y === food.y) {
                score++;
                window.postMessage({ type: "scoreUpdate", newScore: score }, "*");
                food = getRandomFoodPosition();
            } else {
                snake.pop();
            }
        }

        draw();
        gameInterval = requestAnimationFrame(gameLoop);
    }

    function draw() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        drawGrid();
        drawFood();
        drawSnake();
    }

    function getRandomFoodPosition() {
        let newPosition;
        do {
            newPosition = {
                x: Math.floor(Math.random() * (context.canvas.width / gridSize)) * gridSize,
                y: Math.floor(Math.random() * (context.canvas.height / gridSize)) * gridSize,
            };
        } while (snake.some(segment => segment.x === newPosition.x && segment.y === newPosition.y));

        return newPosition;
    }

    return {
        initialize,
        startGame,
        resetGame,
        handleKeyPress,
    };
})();

export default GameLogic;
