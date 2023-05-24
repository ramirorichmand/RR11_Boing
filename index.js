const WIDTH = 800;
const HEIGHT = 256;
const GRAVITY = 1;
const JUMP_STRENGTH = -20;
const JUMP_STOP_VELOCITY = -4;
const OBSTACLE_SIZE = { width: 32, height: 64 };
const LOCALSTORAGE_HIGHSCORE_KEY = "boing-highscore";
const UPDATE_INTERVAL_MS = 1000 / 60;

let updateInterval = null;

const CONTROLS = {
    jump: [" ", "w", "arrowup"],
    pause: ["p", "escape"],
    reset: ["r"],
};

const BOING_EL = document.querySelector("#boing");
const OBSTACLES_EL = document.querySelector("#obstacles");
const MESSAGE_EL = document.querySelector("#message");
const SCORE_EL = document.querySelector("#score");
const HIGHSCORE_MESSAGE_EL =
    document.querySelector("#highscore");

let game;
let boing;

const OBSTACLE_SPAWN_INTERVAL_MS_RANGE = [500, 2000];
let obstacleSpawnTimeout = null;

function createBoingState() {
    return {
        x: 64,
        y: HEIGHT - 64,
        width: 32,
        height: 64,
        yVelocity: 0,
        isOnGround: false,
        isJumping: false,
        element: BOING_EL,
    };
}

function createGameState() {
    return {
        isRunning: false,
        isGameOver: false,
        speed: 10,
        obstacles: [],
        score: 0,
    };
}

function main() {
    resetGame();
    setupControls();
    // startGame();
}

function startGame() {
    if (game.isGameOver || game.isRunning) return;

    game.isRunning = true;
    clearMessage();
    startSpawningObstacles();
    startUpdateLoop();
}

function stopGame() {
    if (!game.isRunning) return;

    game.isRunning = false;
    stopSpawningObstacles();
    stopUpdateLoop();
}

function resumeGame() {
    startGame();
}

function pauseGame() {
    stopGame();
    setMessage("PAUSED press P to resume");
}

function resetGame() {
    game = createGameState();
    boing = createBoingState();
    setElementPosition(boing.element, boing);
    OBSTACLES_EL.innerHTML = "";
    setMessage("Press SPACE to start!");
    setupControls();
    renderScore(game.score);
    clearHighscoreMessage();
}

function gameOver() {
    stopGame();
    game.isGameOver = true;
    setMessage("GAME OVER press R to reset");
    handleHighscore();
}

function handleHighscore() {
    const highscore = getHighscore();
    if (game.score > highscore) {
        saveHighscore(game.score);
        setHighscoreMessage("New Highscore!");
    } else {
        setHighscoreMessage(`Highscore: ${highscore}`);
    }
}

function getHighscore() {
    const value = window.localStorage.getItem(
        LOCALSTORAGE_HIGHSCORE_KEY,
    );
    if (value === null) {
        return 0;
    }

    const highscore = parseInt(value);
    return Number.isNaN(highscore) ? 0 : highscore;
}

function saveHighscore(score) {
    window.localStorage.setItem(
        LOCALSTORAGE_HIGHSCORE_KEY,
        score.toString(),
    );
}

function setHighscoreMessage(msg) {
    HIGHSCORE_MESSAGE_EL.innerText = msg;
    HIGHSCORE_MESSAGE_EL.classList.remove("hidden");
}

function clearHighscoreMessage() {
    HIGHSCORE_MESSAGE_EL.classList.add("hidden");
}

function startSpawningObstacles() {
    stopSpawningObstacles();
    const setSpawnTimeout = () => {
        obstacleSpawnTimeout = setTimeout(() => {
            spawnObstacle();
            setSpawnTimeout();
        }, getRandomObstacleSpawnDelay());
    };
    setSpawnTimeout();
}

function getRandomObstacleSpawnDelay() {
    return randomInRange(
        OBSTACLE_SPAWN_INTERVAL_MS_RANGE[0],
        OBSTACLE_SPAWN_INTERVAL_MS_RANGE[1],
    );
}

function randomInRange(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

function stopSpawningObstacles() {
    if (obstacleSpawnTimeout !== null) {
        clearTimeout(obstacleSpawnTimeout);
        obstacleSpawnTimeout = null;
    }
}

let eventListeners = [];
function setupControls() {
    cleanupEventListeners();

    const keyDown = (e) =>
        !e.repeat && onKeyDown(e.key.toLowerCase());
    const keyUp = (e) => onKeyUp(e.key.toLowerCase());

    document.addEventListener("keydown", keyDown);
    eventListeners.push([document, "keydown", keyDown]);
    document.addEventListener("keyup", keyUp);
    eventListeners.push([document, "keyup", keyUp]);

    const startGameInitially = (e) => {
        if (
            getActionForKey(e.key.toLowerCase()) !== "jump"
        ) {
            return;
        }

        clearMessage();
        startGame();
        document.removeEventListener(
            "keydown",
            startGameInitially,
        );
    };
    document.addEventListener(
        "keydown",
        startGameInitially,
    );
    eventListeners.push([
        document,
        "keydown",
        startGameInitially,
    ]);

    // window on blur