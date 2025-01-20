// src/game_logic/GameLogicVsRabbit.js

const GameLogicVsRabbit = (() => {
    const gridSize = 20;
    let context = null;
    let gameInterval = null;
    let lastFrameTime = 0;
    let gameSpeed = 150;

    // -----------------------------
    // Obiekt z grafikami
    // -----------------------------
    const images = {
        snake: {
            head: {
                up: new Image(),
                down: new Image(),
                left: new Image(),
                right: new Image(),
            },
            body: {
                horizontal: new Image(),
                vertical: new Image(),
                topleft: new Image(),
                topright: new Image(),
                bottomleft: new Image(),
                bottomright: new Image(),
            },
            tail: {
                up: new Image(),
                down: new Image(),
                left: new Image(),
                right: new Image(),
            },
        },
        snakeFood: new Image(),   // mouse.png – jedzenie węża
        rabbitFood: new Image(),  // carrot.png – jedzenie królika
        rabbit: new Image(),      // rabbit.png – sprite samego królika
    };

    /**
     * Funkcja do ładowania wszystkich obrazków.
     * Po załadowaniu wywołuje callback().
     */
    function loadImages(callback) {
        // Ścieżki do plików graficznych
        const imagePaths = {
            // WĄŻ
            'snake.head.up': '/Graphics/head_up.png',
            'snake.head.down': '/Graphics/head_down.png',
            'snake.head.left': '/Graphics/head_left.png',
            'snake.head.right': '/Graphics/head_right.png',
            'snake.body.horizontal': '/Graphics/body_horizontal.png',
            'snake.body.vertical': '/Graphics/body_vertical.png',
            'snake.body.topleft': '/Graphics/body_topleft.png',
            'snake.body.topright': '/Graphics/body_topright.png',
            'snake.body.bottomleft': '/Graphics/body_bottomleft.png',
            'snake.body.bottomright': '/Graphics/body_bottomright.png',
            'snake.tail.up': '/Graphics/tail_up.png',
            'snake.tail.down': '/Graphics/tail_down.png',
            'snake.tail.left': '/Graphics/tail_left.png',
            'snake.tail.right': '/Graphics/tail_right.png',

            // Osobne grafiki
            snakeFood: '/Graphics/mouse.png',    // mysz
            rabbitFood: '/Graphics/carrot.png',  // marchewka
            rabbit: '/Graphics/rabbit.png',      // sprite królika
        };

        let loadedImages = 0;
        const totalImages = Object.keys(imagePaths).length;

        Object.keys(imagePaths).forEach((key) => {
            const keys = key.split('.');
            let target = images;

            keys.forEach((k, i) => {
                if (i === keys.length - 1) {
                    // przypisanie finalne
                    target[k].src = imagePaths[key];
                    target[k].onload = () => {
                        loadedImages++;
                        if (loadedImages === totalImages) {
                            callback(); // wszystkie grafiki załadowane
                        }
                    };
                    target[k].onerror = () => {
                        console.error(`Nie udało się załadować obrazka: ${imagePaths[key]}`);
                    };
                } else {
                    // schodzimy w głąb obiektu (np. snake.head)
                    target = target[k];
                }
            });
        });
    }

    // -----------------------------
    // Parametry stanu gry
    // -----------------------------
    let snake = [];
    let snakeDX = 0;
    let snakeDY = 0;
    let snakeLength = 5;

    let rabbit = { x: 0, y: 0 };
    let rabbitDX = 0;
    let rabbitDY = 0;
    let rabbitCarrotCount = 0;

    const RABBIT_WIN_CARROTS = 10; // królik wygrywa po 10 marchewek

    // Myszki (dla węża) i marchewki (dla królika)
    let mice = [];
    let carrots = [];

    // Boost prędkości królika
    let isSpeedBoost = false;
    let speedBoostTimer = 0;

    // Timery spawnu
    let carrotSpawnTimer = 0;
    let mouseSpawnTimer = 0;

    // Licznik zjedzonych myszek przez węża
    let snakeMiceCount = 0;

    // ================ FUNKCJE API ================
    function initialize(ctx, callback) {
        context = ctx;
        // Najpierw ładujemy grafiki
        loadImages(() => {
            // Po załadowaniu
            resetGame();
            if (callback) callback();
        });
    }

    function resetGame() {
        if (gameInterval) {
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
        }
        lastFrameTime = 0;

        // Wąż
        snakeLength = 5;
        const centerX = Math.floor((context.canvas.width / gridSize) / 2) * gridSize;
        const centerY = Math.floor((context.canvas.height / gridSize) / 2) * gridSize;
        snake = [];
        for (let i = 0; i < snakeLength; i++) {
            snake.push({ x: centerX, y: centerY + i * gridSize });
        }
        snakeDX = 0;
        snakeDY = -gridSize;
        snakeMiceCount = 0;

        // Królik
        rabbitCarrotCount = 0;
        do {
            rabbit = getRandomPosition();
        } while (snake.some(seg => seg.x === rabbit.x && seg.y === rabbit.y));
        rabbitDX = 0;
        rabbitDY = 0;

        mice = [];
        carrots = [];
        carrotSpawnTimer = 0;
        mouseSpawnTimer = 0;
        isSpeedBoost = false;
        speedBoostTimer = 0;

        draw();
    }

    function startGame(speed) {
        if (gameInterval) {
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
        }
        gameSpeed = speed;
        lastFrameTime = performance.now();
        gameInterval = requestAnimationFrame(gameLoop);
    }

    function handleKeyPress(key) {
        switch (key) {
            // Wąż (WASD)
            case 'w':
            case 'W':
                if (snakeDY !== gridSize) {
                    snakeDX = 0;
                    snakeDY = -gridSize;
                }
                break;
            case 's':
            case 'S':
                if (snakeDY !== -gridSize) {
                    snakeDX = 0;
                    snakeDY = gridSize;
                }
                break;
            case 'a':
            case 'A':
                if (snakeDX !== gridSize) {
                    snakeDX = -gridSize;
                    snakeDY = 0;
                }
                break;
            case 'd':
            case 'D':
                if (snakeDX !== -gridSize) {
                    snakeDX = gridSize;
                    snakeDY = 0;
                }
                break;

            // Królik (strzałki)
            case 'ArrowUp':
                if (rabbitDY !== gridSize) {
                    rabbitDX = 0;
                    rabbitDY = -gridSize;
                }
                break;
            case 'ArrowDown':
                if (rabbitDY !== -gridSize) {
                    rabbitDX = 0;
                    rabbitDY = gridSize;
                }
                break;
            case 'ArrowLeft':
                if (rabbitDX !== gridSize) {
                    rabbitDX = -gridSize;
                    rabbitDY = 0;
                }
                break;
            case 'ArrowRight':
                if (rabbitDX !== -gridSize) {
                    rabbitDX = gridSize;
                    rabbitDY = 0;
                }
                break;
            default:
                break;
        }
    }

    // ================ PĘTLA ANIMACJI ================
    function gameLoop(currentTime) {
        if (!gameInterval) return;
        const deltaTime = currentTime - lastFrameTime;
        if (deltaTime >= gameSpeed) {
            lastFrameTime = currentTime;
            update();
            if (!gameInterval) return;
        }
        draw();
        if (!gameInterval) return;
        gameInterval = requestAnimationFrame(gameLoop);
    }

    // ================ UPDATE ================
    function update() {
        // Spawning marchewek i myszek
        carrotSpawnTimer += gameSpeed;
        if (carrotSpawnTimer >= 5000) {
            const c = getRandomPosition();
            carrots.push(c);
            carrotSpawnTimer = 0;
        }

        mouseSpawnTimer += gameSpeed;
        if (mouseSpawnTimer >= 7000) {
            const m = getRandomPosition();
            mice.push(m);
            mouseSpawnTimer = 0;
        }

        // Boost królika
        if (isSpeedBoost) {
            speedBoostTimer += gameSpeed;
            if (speedBoostTimer >= 3000) {
                isSpeedBoost = false;
                speedBoostTimer = 0;
            }
        }

        moveSnake();
        if (!gameInterval) return;

        moveRabbit();
        if (!gameInterval) return;

        checkCollisions();
    }

    // ------------------------------
    // Ruch węża
    // ------------------------------
    function moveSnake() {
        const head = { x: snake[0].x + snakeDX, y: snake[0].y + snakeDY };
        // kolizja
        if (
            head.x < 0 || head.x >= context.canvas.width ||
            head.y < 0 || head.y >= context.canvas.height ||
            snake.some(seg => seg.x === head.x && seg.y === head.y)
        ) {
            window.postMessage({ type: "gameOverVsRabbit", winner: "rabbit" }, "*");
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
            return;
        }
        snake.unshift(head);

        // zjedzenie myszki?
        const eatenMouseIndex = mice.findIndex(m => m.x === head.x && m.y === head.y);
        if (eatenMouseIndex >= 0) {
            mice.splice(eatenMouseIndex, 1);
            snakeMiceCount++;
            // info o stanie
            window.postMessage({
                type: "scoreUpdateVsRabbit",
                snakeMiceCount,
                rabbitCarrotCount
            }, "*");
        } else {
            snake.pop();
        }
    }

    // ------------------------------
    // Ruch królika
    // ------------------------------
    function moveRabbit() {
        const moveDistance = isSpeedBoost ? gridSize * 2 : gridSize;
        const oldPos = { x: rabbit.x, y: rabbit.y };
        const newX = rabbit.x + Math.sign(rabbitDX) * moveDistance;
        const newY = rabbit.y + Math.sign(rabbitDY) * moveDistance;

        // blokada przejścia przez ciało
        const indexOnSnake = snake.findIndex((seg, idx) => seg.x === newX && seg.y === newY);
        if (indexOnSnake >= 0) {
            if (indexOnSnake === 0) {
                // głowa węża
                window.postMessage({ type: "gameOverVsRabbit", winner: "snake" }, "*");
                cancelAnimationFrame(gameInterval);
                gameInterval = null;
            } else {
                // ciało -> cofamy ruch
                rabbit.x = oldPos.x;
                rabbit.y = oldPos.y;
            }
            return;
        }

        rabbit.x = newX;
        rabbit.y = newY;

        // poza mapą?
        if (
            rabbit.x < 0 || rabbit.x >= context.canvas.width ||
            rabbit.y < 0 || rabbit.y >= context.canvas.height
        ) {
            window.postMessage({ type: "gameOverVsRabbit", winner: "snake" }, "*");
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
            return;
        }

        // zjedzenie marchewki?
        const eatenCarrotIndex = carrots.findIndex(c => c.x === rabbit.x && c.y === rabbit.y);
        if (eatenCarrotIndex >= 0) {
            rabbitCarrotCount++;
            carrots.splice(eatenCarrotIndex, 1);

            // bonus speed
            isSpeedBoost = true;
            speedBoostTimer = 0;

            window.postMessage({
                type: "scoreUpdateVsRabbit",
                snakeMiceCount,
                rabbitCarrotCount
            }, "*");

            if (rabbitCarrotCount >= RABBIT_WIN_CARROTS) {
                window.postMessage({ type: "gameOverVsRabbit", winner: "rabbit" }, "*");
                cancelAnimationFrame(gameInterval);
                gameInterval = null;
                return;
            }
        }
    }

    // ------------------------------
    // Sprawdzenie kolizji głowy węża z królikiem
    // ------------------------------
    function checkCollisions() {
        if (!gameInterval) return;
        const head = snake[0];
        if (head.x === rabbit.x && head.y === rabbit.y) {
            window.postMessage({ type: "gameOverVsRabbit", winner: "snake" }, "*");
            cancelAnimationFrame(gameInterval);
            gameInterval = null;
        }
    }

    // ------------------------------
    // Rysowanie węża
    // ------------------------------
    function drawSnake() {
        snake.forEach((segment, index) => {
            let img = images.snake.body.vertical;

            if (index === 0) {
                // głowa
                const headNext = snake[1];
                if (headNext) {
                    if (segment.x > headNext.x) img = images.snake.head.right;
                    else if (segment.x < headNext.x) img = images.snake.head.left;
                    else if (segment.y < headNext.y) img = images.snake.head.up;
                    else if (segment.y > headNext.y) img = images.snake.head.down;
                }
            } else if (index === snake.length - 1) {
                // ogon
                const prev = snake[index - 1];
                if (prev) {
                    if (prev.x > segment.x) img = images.snake.tail.left;
                    else if (prev.x < segment.x) img = images.snake.tail.right;
                    else if (prev.y > segment.y) img = images.snake.tail.up;
                    else if (prev.y < segment.y) img = images.snake.tail.down;
                }
            } else {
                // ciało
                const prev = snake[index - 1];
                const next = snake[index + 1];
                if (prev && next) {
                    if (prev.x === segment.x && next.x === segment.x) {
                        img = images.snake.body.vertical;
                    } else if (prev.y === segment.y && next.y === segment.y) {
                        img = images.snake.body.horizontal;
                    } else {
                        // Zakręty
                        if (
                            (prev.x < segment.x && next.y < segment.y) ||
                            (next.x < segment.x && prev.y < segment.y)
                        ) {
                            img = images.snake.body.topleft;
                        } else if (
                            (prev.x > segment.x && next.y < segment.y) ||
                            (next.x > segment.x && prev.y < segment.y)
                        ) {
                            img = images.snake.body.topright;
                        } else if (
                            (prev.x < segment.x && next.y > segment.y) ||
                            (next.x < segment.x && prev.y > segment.y)
                        ) {
                            img = images.snake.body.bottomleft;
                        } else if (
                            (prev.x > segment.x && next.y > segment.y) ||
                            (next.x > segment.x && prev.y > segment.y)
                        ) {
                            img = images.snake.body.bottomright;
                        }
                    }
                }
            }
            context.drawImage(img, segment.x, segment.y, gridSize, gridSize);
        });
    }

    // ------------------------------
    // Rysowanie całej sceny z powiększeniem
    // ------------------------------
    function draw() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        // Tło (szachownica)
        for (let x = 0; x < context.canvas.width; x += gridSize) {
            for (let y = 0; y < context.canvas.height; y += gridSize) {
                context.fillStyle = (x / gridSize + y / gridSize) % 2 === 0 ? '#aad751' : '#a2d149';
                context.fillRect(x, y, gridSize, gridSize);
            }
        }

        // Skale
        const scaleFood = 1.4;    // jedzenie: myszki, marchewki
        const scaleRabbit = 1.6;  // królik

        // Rysowanie marchewek
        carrots.forEach(carrot => {
            const foodSize = gridSize * scaleFood;
            const offset = (gridSize - foodSize) / 2;
            context.drawImage(
                images.rabbitFood,
                carrot.x + offset,
                carrot.y + offset,
                foodSize,
                foodSize
            );
        });

        // Rysowanie myszek
        mice.forEach(mouse => {
            const foodSize = gridSize * scaleFood;
            const offset = (gridSize - foodSize) / 2;
            context.drawImage(
                images.snakeFood,
                mouse.x + offset,
                mouse.y + offset,
                foodSize,
                foodSize
            );
        });

        // Rysowanie królika (powiększone)
        {
            const rabbitSize = gridSize * scaleRabbit;
            const offset = (gridSize - rabbitSize) / 2;
            context.drawImage(
                images.rabbit,
                rabbit.x + offset,
                rabbit.y + offset,
                rabbitSize,
                rabbitSize
            );
        }

        // Rysowanie węża (normalny gridSize)
        drawSnake();
    }

    // Generowanie losowych współrzędnych
    function getRandomPosition() {
        const x = Math.floor(Math.random() * (context.canvas.width / gridSize)) * gridSize;
        const y = Math.floor(Math.random() * (context.canvas.height / gridSize)) * gridSize;
        return { x, y };
    }

    return {
        initialize,
        resetGame,
        startGame,
        handleKeyPress,
    };
})();

export default GameLogicVsRabbit;
