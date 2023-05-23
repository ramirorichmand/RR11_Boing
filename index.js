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
    dino = createDinoState();
    setElementPosition(dino.element, dino);
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