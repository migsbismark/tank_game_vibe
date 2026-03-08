/**
 * Tank Artillery Game - Main Entry
 * Setup screen, HUD, input, game loop
 */

import * as THREE from 'three';
import { Game } from './game.js';

const VIEW_WIDTH = 80;
const VIEW_HEIGHT = 48;
const TERRAIN_BASE = -2; // bottom of terrain shape (minHeight - 2)
const ANGLE_STEP = 3;
const POWER_STEP = 2;
const ANGLE_MIN = -90;
const ANGLE_MAX = 90;
const POWER_MIN = 5;
const POWER_MAX = 50;

let game = null;
let camera = null;
let renderer = null;
let lastTime = 0;
let aiShotDelay = 0;

const setupScreen = document.getElementById('setup-screen');
const hud = document.getElementById('hud');
const roundEnd = document.getElementById('round-end');
const matchEnd = document.getElementById('match-end');
const hudTurn = document.getElementById('hud-turn');
const hudAngle = document.getElementById('hud-angle');
const hudPower = document.getElementById('hud-power');
const hudHealth = document.getElementById('hud-health');
const hudRound = document.getElementById('hud-round');

function init() {
    const bottom = TERRAIN_BASE - 2;
    const top = bottom + VIEW_HEIGHT;
    camera = new THREE.OrthographicCamera(
        -VIEW_WIDTH / 2, VIEW_WIDTH / 2,
        top, bottom,
        0.1, 1000
    );
    camera.position.set(0, 0, 50);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(renderer.domElement);

    window.addEventListener('resize', onResize);
    document.getElementById('start-btn').addEventListener('click', onStartGame);
    document.getElementById('next-round-btn').addEventListener('click', onNextRound);
    document.getElementById('play-again-btn').addEventListener('click', onPlayAgain);
    document.addEventListener('keydown', onKeyDown);

    lastTime = performance.now();
    requestAnimationFrame(animate);
}

function onResize() {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumWidth = VIEW_HEIGHT * aspect;
    camera.left = -frustumWidth / 2;
    camera.right = frustumWidth / 2;
    const bottom = TERRAIN_BASE - 2;
    camera.bottom = bottom;
    camera.top = bottom + VIEW_HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onStartGame() {
    const numTanks = parseInt(document.getElementById('num-tanks').value, 10);
    const difficulty = document.getElementById('difficulty').value;
    game = new Game({ numTanks, difficulty });
    game.startMatch();
    setupScreen.classList.add('hidden');
    hud.classList.remove('hidden');
    roundEnd.classList.remove('visible');
    matchEnd.classList.remove('visible');
    aiShotDelay = 0;
}

function onNextRound() {
    roundEnd.classList.remove('visible');
    game.startRound();
    hud.classList.remove('hidden');
    aiShotDelay = 0;
}

function onPlayAgain() {
    matchEnd.classList.remove('visible');
    setupScreen.classList.remove('hidden');
    hud.classList.add('hidden');
    game = null;
}

function onKeyDown(e) {
    if (!game || game.state !== 'playing' && game.state !== 'projectile') return;
    const tank = game.getCurrentTank();
    if (!tank || !tank.isPlayer) return;

    if (e.key === 'ArrowUp') {
        e.preventDefault();
        tank.angle = Math.min(ANGLE_MAX, tank.angle + ANGLE_STEP);
        tank.updateMesh(game.terrain);
    } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        tank.angle = Math.max(ANGLE_MIN, tank.angle - ANGLE_STEP);
        tank.updateMesh(game.terrain);
    } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        tank.power = Math.min(POWER_MAX, tank.power + POWER_STEP);
    } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        tank.power = Math.max(POWER_MIN, tank.power - POWER_STEP);
    } else if (e.key === ' ') {
        e.preventDefault();
        if (game.canShoot()) {
            game.fire(tank.angle, tank.power);
        }
    }
}

function updateHUD() {
    if (!game) return;
    const tank = game.getCurrentTank();
    if (tank) {
        hudTurn.textContent = tank.isPlayer ? 'Turn: You' : `Turn: AI ${tank.index + 1}`;
        hudAngle.textContent = `Angle: ${Math.round(tank.angle)}°`;
        hudPower.textContent = `Power: ${Math.round(tank.power)}`;
        hudHealth.textContent = `Health: ${Math.round(tank.health)}`;
    }
    hudRound.textContent = `Round ${game.currentRound}`;
}

function animate(now) {
    requestAnimationFrame(animate);
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    if (game) {
        game.update(dt);
        updateHUD();

        if (game.state === 'playing') {
            const tank = game.getCurrentTank();
            if (tank && !tank.isPlayer) {
                aiShotDelay += dt;
                if (aiShotDelay > 0.8) {
                    game.aiTakeShot();
                    aiShotDelay = 0;
                }
            }
        }

        if (game.state === 'roundEnd') {
            hud.classList.add('hidden');
            document.getElementById('round-winner-text').textContent = game.roundWinner
                ? (game.roundWinner.isPlayer ? 'You win this round!' : `AI ${game.roundWinner.index + 1} wins!`)
                : 'Draw!';
            const scores = game.roundScores;
            const maxScore = Math.max(...Object.values(scores), 0);
            if (maxScore >= game.roundsToWin) {
                game.state = 'matchEnd';
                matchEnd.classList.add('visible');
                const winnerIdx = Object.entries(scores).find(([, s]) => s >= game.roundsToWin)?.[0];
                const winner = game.tanks.find(t => String(t.index) === winnerIdx);
                document.getElementById('match-winner-text').textContent =
                    winner?.isPlayer ? 'You win the match!' : `AI ${(winner?.index ?? 0) + 1} wins the match!`;
            } else {
                roundEnd.classList.add('visible');
            }
        }
    }

    if (game?.scene && camera) {
        renderer.render(game.scene, camera);
    }
}

init();
