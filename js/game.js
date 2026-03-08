/**
 * Tank Artillery Game - Game Logic
 * Orchestrates terrain, tanks, projectiles, turns, AI, explosions
 */

import * as THREE from 'three';
import { TerrainSystem } from './terrain.js';
import { Tank, spawnTanks, TANK_HEIGHT, TURRET_LENGTH } from './tank.js';
import { Projectile, anglePowerToVelocity } from './projectile.js';
import { TurnManager } from './turnManager.js';
import { selectTarget, computeAim, clampToValidAngle } from './ai.js';
import {
    triggerExplosion,
    createExplosionEffect,
    updateExplosionParticles,
    applyExplosionDamage
} from './explosion.js';

const VIEW_WIDTH = 80;
const VIEW_HEIGHT = 48;
const GRAVITY = 15;
const EXPLOSION_RADIUS = 3;
const EXPLOSION_POWER = 2;
const DESTRUCTION_RADIUS = 4;
const DESTRUCTION_POWER = 2.5;
const TANK_HIT_RADIUS = 0.5;
const POWER_MIN = 5;
const POWER_MAX = 50;

export class Game {
    constructor(config = {}) {
        this.numTanks = Math.max(2, Math.min(10, config.numTanks ?? 3));
        this.difficulty = config.difficulty ?? 'medium';
        this.roundsToWin = config.roundsToWin ?? 2;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb);

        this.terrain = new TerrainSystem({
            width: VIEW_WIDTH,
            resolution: 80
        });
        this.terrain.generate();
        this.scene.add(this.terrain.createMesh());

        this.tanks = [];
        this.turnManager = null;
        this.projectile = null;
        this.firingTank = null;
        this.explosionEffects = [];
        this.state = 'setup'; // setup | playing | projectile | roundEnd | matchEnd
        this.roundWinner = null;
        this.matchWinner = null;
        this.roundScores = {};
        this.currentRound = 0;
    }

    startMatch() {
        this.state = 'playing';
        this.roundScores = {};
        this.currentRound = 0;
        this.startRound();
    }

    startRound() {
        this.currentRound++;
        this.tanks.forEach(t => t.destroy());
        this.tanks = [];

        this.terrain.generate();
        this.terrain.createMesh();
        this.scene.add(this.terrain.getMesh());

        this.tanks = spawnTanks(this.terrain, this.numTanks);
        this.tanks.forEach(t => {
            if (t.isPlayer) t.angle = clampToValidAngle(t, this.terrain, t.angle);
            t.createMesh();
            this.scene.add(t.getMesh());
        });

        this.turnManager = new TurnManager(this.tanks);
        this.projectile = null;
        this.firingTank = null;
        this.explosionEffects = [];
        this.state = 'playing';
        this.roundWinner = null;
    }

    getCurrentTank() {
        return this.turnManager?.getCurrentTank() ?? null;
    }

    canShoot() {
        const tank = this.getCurrentTank();
        return tank && tank.alive && this.state === 'playing' && !this.projectile;
    }

    fire(angle, power) {
        const tank = this.getCurrentTank();
        if (!tank || !tank.alive || this.projectile) return false;

        let a = angle;
        if (a < 0) a += 360;
        if (a >= 360) a -= 360;
        const p = Math.max(POWER_MIN, Math.min(POWER_MAX, power));

        // Spawn at exact muzzle position - turret pivot is at top of tank body
        const rad = (a * Math.PI) / 180;
        const barrelLength = TURRET_LENGTH;
        const turretPivotY = TANK_HEIGHT; // pivot at top of body
        const spawnX = tank.position.x + barrelLength * Math.cos(rad);
        const spawnY = tank.position.y + turretPivotY + barrelLength * Math.sin(rad);

        const vel = anglePowerToVelocity(a, p);
        this.projectile = new Projectile(spawnX, spawnY, vel.x, vel.y);
        this.firingTank = tank;
        this.scene.add(this.projectile.createMesh());
        this.state = 'projectile';
        return true;
    }

    update(dt) {
        // Update explosion particles
        this.explosionEffects = this.explosionEffects.filter(g => {
            const alive = updateExplosionParticles(g, dt);
            if (!alive && g.parent) g.parent.remove(g);
            return alive;
        });

        if (this.state !== 'projectile' || !this.projectile) {
            return;
        }

        this.projectile.update(dt);
        const px = this.projectile.position.x;
        const py = this.projectile.position.y;

        // Grace period: skip collision until projectile has traveled 4+ units AND 0.25s has passed
        const distX = px - this.projectile.spawnPosition.x;
        const distY = py - this.projectile.spawnPosition.y;
        const distTraveled = Math.sqrt(distX * distX + distY * distY);
        const inGracePeriod = distTraveled < 4 || this.projectile.age < 0.25;

        // Terrain collision
        if (!inGracePeriod) {
            const terrainY = this.terrain.getHeight(px);
            if (py <= terrainY) {
                this.onProjectileImpact(px, terrainY);
                return;
            }
        }

        // Tank collision (skip firing tank - can't hit yourself, skip during grace period)
        if (!inGracePeriod) {
        for (const t of this.tanks) {
            if (!t.alive || t === this.firingTank) continue;
            const dx = px - t.position.x;
            const dy = py - (t.position.y + TANK_HEIGHT / 2); // tank body center for hit box
            if (dx * dx + dy * dy < TANK_HIT_RADIUS * TANK_HIT_RADIUS) {
                this.onProjectileImpact(px, py);
                return;
            }
        }
        }

        // Out of bounds
        const halfW = this.terrain.width / 2;
        if (px < -halfW - 2 || px > halfW + 2 || py < -10) {
            this.projectile.destroy();
            this.projectile = null;
            this.firingTank = null;
            this.state = 'playing';
            this.turnManager.next();
        }
    }

    onProjectileImpact(x, y) {
        this.projectile.destroy();
        this.projectile = null;
        this.firingTank = null;

        const effect = triggerExplosion(this.scene, this.terrain, this.tanks, x, y, {
            radius: EXPLOSION_RADIUS,
            power: EXPLOSION_POWER
        });
        this.explosionEffects.push(effect);

        // Destroyed tanks: trigger destruction explosion only if not at impact (avoids double explosion on direct hit)
        const impactX = x;
        const impactY = y;
        this.tanks.filter(t => !t.alive).forEach(t => {
            const dx = t.position.x - impactX;
            const dy = (t.position.y + TANK_HEIGHT / 2) - impactY;
            const distSq = dx * dx + dy * dy;
            const skipDestruction = distSq < 4; // within ~2 units of impact = direct hit, use impact explosion only
            if (!skipDestruction) {
                applyExplosionDamage(this.tanks, t.position.x, t.position.y, DESTRUCTION_RADIUS, 60);
                this.terrain.deformTerrain(t.position.x, DESTRUCTION_RADIUS, DESTRUCTION_POWER);
                const destEffect = createExplosionEffect(this.scene, t.position.x, t.position.y, DESTRUCTION_RADIUS);
                this.explosionEffects.push(destEffect);
            }
            t.destroy();
        });

        // Update tank positions (terrain may have changed)
        this.tanks.filter(t => t.alive).forEach(t => t.updateMesh(this.terrain));

        const alive = this.turnManager.aliveCount();
        if (alive <= 1) {
            this.roundWinner = this.tanks.find(t => t.alive);
            this.state = 'roundEnd';
            if (this.roundWinner) {
                this.roundScores[this.roundWinner.index] = (this.roundScores[this.roundWinner.index] ?? 0) + 1;
            }
        } else {
            this.state = 'playing';
            this.turnManager.next();
        }
    }

    aiTakeShot() {
        const tank = this.getCurrentTank();
        if (!tank || tank.isPlayer || this.projectile) return;

        const target = selectTarget(tank, this.tanks);
        if (!target) return;

        const { angle, power } = computeAim(tank, target, this.terrain, this.difficulty);
        tank.angle = angle;
        tank.power = power;
        tank.updateMesh(this.terrain); // rotate turret to match before firing
        this.fire(angle, power);
    }

    getAliveTanks() {
        return this.tanks.filter(t => t.alive);
    }
}
