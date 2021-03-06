// functions
import {LEVEL, OBJECT_TYPE} from './setup';
import { randomMovement } from './ghostMoves';
// classes
import GameBoard from './GameBoard';
import Pacman from './Pacman';
import Ghost from './Ghost';
// sounds
import soundDot from './sounds/munch.wav';
import soundPill from './sounds/pill.wav';
import soundGameStart from './sounds/game_start.wav';
import soundGameOver from './sounds/death.wav';
import soundGhost from './sounds/eat_ghost.wav';

// dom elements
const gameGrid = document.querySelector('#game');
const scoreTable = document.querySelector('.score');
const startButton = document.querySelector('#start-button');

// game constants
const POWER_PILL_TIME = 10000; // ms
const GLOBAL_SPEED = 80; // ms
const gameBoard = GameBoard.createGameBoard(gameGrid, LEVEL);

// initial setup
let score = 0;
let timer = null;
let gameWin = false;
let powerPillActive = false;
let powerPillTimer = null;

// play audio game
function playAudio(audio) {
    // params will be replace w specific imported sound
    const soundEffect = new Audio(audio);
    soundEffect.play();
}

// when game over
function gameOver(pacman, grid) {
    playAudio(soundGameOver);
    // event from keyboard will cant make changes on board
    document.removeEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );
    gameBoard.showGameStatus(gameWin);
    clearInterval(timer);
    startButton.classList.remove('hide');
}

// collision between pacman and ghosts
function checkCollision(pacman, ghosts) {
    // search ghost pos, are same w pacman?
    const collidedGhost = ghosts.find(ghost => pacman.pos === ghost.pos);

    if(collidedGhost) {
        // if there's same pos, it'll be return 1
        if(pacman.powerPill) {
            // if pacman eat pill, ghost scare and will be removed
            playAudio(soundGhost);

            gameBoard.removeObject(collidedGhost.pos, [
                OBJECT_TYPE.GHOST,
                OBJECT_TYPE.SCARED,
                collidedGhost.name
            ]);
            collidedGhost.pos = collidedGhost.startPos;
            score += 100;
        } else {
            // pacman will be removed, game over
            gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PACMAN]);
            gameBoard.rotateDiv(pacman.pos, 0);
            gameOver(pacman, gameGrid);
        }
    }
}

function gameLoop(pacman, ghosts) {
    gameBoard.moveCharacter(pacman);
    checkCollision(pacman, ghosts);

    ghosts.forEach((ghost) => gameBoard.moveCharacter(ghost));
    checkCollision(pacman, ghosts);
        
    // check if pacman eats a dot
    if(gameBoard.objectExist(pacman.pos, OBJECT_TYPE.DOT)) {
        playAudio(soundDot);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.DOT]);
        gameBoard.dotCount--;
        score += 10;
    }

    // check if pacman eats a powerpill
    if(gameBoard.objectExist(pacman.pos, OBJECT_TYPE.PILL)) {
        playAudio(soundPill);
        gameBoard.removeObject(pacman.pos, [OBJECT_TYPE.PILL]);
        pacman.powerPill = true;
        score += 50;
        clearTimeout(powerPillTimer);
        powerPillTimer = setTimeout(
            () => (pacman.powerPill = false),
            POWER_PILL_TIME
        );
    }

    // change ghosts scare mode
    if(pacman.powerPill !== powerPillActive) {
        powerPillActive = pacman.powerPill;
        ghosts.forEach((ghost) => (ghost.isScared = pacman.powerPill));
    }

    // if all dots have been eaten
    if(gameBoard.dotCount === 0) {
        gameWin = true;
        gameOver(pacman, ghosts);
    }

    // show score
    scoreTable.innerHTML = score;
}

function startGame() {
    playAudio(soundGameStart);
    
    // initial state when the game start
    gameWin = false;
    powerPillActive = false;
    score = 0;

    // hide and unhide element
    startButton.classList.add('hide');
    scoreTable.classList.remove('hide');

    // create grid
    gameBoard.createGrid(LEVEL);

    // placing all character
    const pacman = new Pacman(2, 287);
    gameBoard.addObject(287, [OBJECT_TYPE.PACMAN]);
    document.addEventListener('keydown', (e) =>
        pacman.handleKeyInput(e, gameBoard.objectExist)
    );
    const ghosts = [
        new Ghost(5, 188, randomMovement, OBJECT_TYPE.BLINKY),
        new Ghost(4, 209, randomMovement, OBJECT_TYPE.PINKY),
        new Ghost(3, 230, randomMovement, OBJECT_TYPE.INKY),
        new Ghost(2, 251, randomMovement, OBJECT_TYPE.CLYDE)
    ];
    timer = setInterval(() => gameLoop(pacman, ghosts), GLOBAL_SPEED);
}

// initialize game
startButton.addEventListener('click', startGame);