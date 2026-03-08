/**
 * Tank Artillery Game - AI System
 * Phase 9: Target selection, physics-based aiming, difficulty levels
 * AI uses 0-360° angle, limited by terrain at tank's position.
 */

import { TANK_HEIGHT, TURRET_LENGTH } from './tank.js';
const DIFFICULTY_ERROR = {
    easy: { angle: 12, power: 0.4 },
    medium: { angle: 6, power: 0.2 },
    hard: { angle: 2, power: 0.08 }
};
const CHECK_DISTANCE = 2; // distance to check if shot clears terrain
const ANGLE_STEP = 5; // step when sampling valid angles

/**
 * Check if a shot at this angle would clear the terrain immediately.
 * @param {Tank} tank
 * @param {TerrainSystem} terrain
 * @param {number} angleDeg - angle in degrees (0-360)
 * @returns {boolean}
 */
function isValidAngle(tank, terrain, angleDeg) {
    const rad = (angleDeg * Math.PI) / 180;
    const muzzleX = tank.position.x + TURRET_LENGTH * Math.cos(rad);
    const muzzleY = tank.position.y + TANK_HEIGHT + TURRET_LENGTH * Math.sin(rad);
    const checkX = muzzleX + CHECK_DISTANCE * Math.cos(rad);
    const checkY = muzzleY + CHECK_DISTANCE * Math.sin(rad);
    const terrainH = terrain.getHeight(checkX);
    return checkY > terrainH + 0.1;
}

/**
 * Clamp angle to nearest valid (terrain-clearing) angle.
 * @param {Tank} tank
 * @param {TerrainSystem} terrain
 * @param {number} desiredDeg - desired angle 0-360
 * @returns {number}
 */
export function clampToValidAngle(tank, terrain, desiredDeg) {
    if (isValidAngle(tank, terrain, desiredDeg)) return desiredDeg;
    for (let delta = ANGLE_STEP; delta < 180; delta += ANGLE_STEP) {
        const a1 = (desiredDeg + delta) % 360;
        const a2 = (desiredDeg - delta + 360) % 360;
        if (isValidAngle(tank, terrain, a1)) return a1;
        if (isValidAngle(tank, terrain, a2)) return a2;
    }
    return desiredDeg;
}

/**
 * Select a random alive enemy tank (not self).
 */
export function selectTarget(self, tanks) {
    const enemies = tanks.filter(t => t.alive && t !== self);
    if (enemies.length === 0) return null;
    return enemies[Math.floor(Math.random() * enemies.length)];
}

/**
 * Compute aim angle (0-360) and power. Angle is limited by terrain.
 * @param {Tank} shooter
 * @param {Tank} target
 * @param {TerrainSystem} terrain
 * @param {string} difficulty
 * @returns {{ angle: number, power: number }}
 */
export function computeAim(shooter, target, terrain, difficulty = 'medium') {
    const dx = target.position.x - shooter.position.x;
    const dy = target.position.y - shooter.position.y;

    const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;

    angle = clampToValidAngle(shooter, terrain, angle);

    const powerBase = dist * 0.5 + 15;
    let power = Math.max(5, Math.min(50, powerBase));

    const err = DIFFICULTY_ERROR[difficulty] ?? DIFFICULTY_ERROR.medium;
    angle += (Math.random() - 0.5) * 2 * err.angle;
    power *= 1 + (Math.random() - 0.5) * 2 * err.power;
    power = Math.max(5, Math.min(50, power));

    if (angle < 0) angle += 360;
    if (angle >= 360) angle -= 360;
    angle = clampToValidAngle(shooter, terrain, angle);

    return { angle, power };
}
