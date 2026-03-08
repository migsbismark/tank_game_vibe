/**
 * Tank Artillery Game - Tank Entity
 * Phase 3: Tank entity, rendering, spawning, player identification
 */

import * as THREE from 'three';

const DEFAULT_HEALTH = 100;
const ANGLE_MIN = -90;
const ANGLE_MAX = 90;
const POWER_MIN = 5;
const POWER_MAX = 50;
export const TANK_WIDTH = 0.8;
const HEALTH_BAR_WIDTH = 1;
const HEALTH_BAR_HEIGHT = 0.12;
export const TANK_HEIGHT = 0.5;
export const TURRET_LENGTH = 0.45;
export const TURRET_THICKNESS = 0.08;

/**
 * Tank entity with position, health, angle, power, alive state.
 */
export class Tank {
    /**
     * @param {Object} options
     * @param {number} options.x - World x position
     * @param {number} options.y - World y position (terrain height)
     * @param {number} [options.health=100] - Starting health
     * @param {boolean} [options.isPlayer=false] - Whether this is the player tank
     * @param {number} [options.index=0] - Tank index for identification
     */
    constructor(options = {}) {
        this.position = { x: options.x ?? 0, y: options.y ?? 0 };
        this.health = options.health ?? DEFAULT_HEALTH;
        this.angle = options.angle ?? 45; // degrees, 0=horizontal right, 90=up
        this.power = options.power ?? 25;
        this.alive = true;
        this.isPlayer = options.isPlayer ?? false;
        this.index = options.index ?? 0;

        this._mesh = null;
        this._turretPivot = null;
        this._healthBarBack = null;
        this._healthBarFill = null;
    }

    /** Create Three.js mesh (box body + turret barrel). */
    createMesh() {
        const bodyGeo = new THREE.BoxGeometry(TANK_WIDTH, TANK_HEIGHT, 0.4);
        const bodyMat = new THREE.MeshBasicMaterial({
            color: this.isPlayer ? 0x3498db : 0x95a5a6
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = TANK_HEIGHT / 2;

        // Turret barrel: long in X (points right by default), pivots at base
        const turretGeo = new THREE.BoxGeometry(TURRET_LENGTH, TURRET_THICKNESS, TURRET_THICKNESS);
        const turretMat = new THREE.MeshBasicMaterial({
            color: this.isPlayer ? 0x2980b9 : 0x7f8c8d
        });
        const turretBarrel = new THREE.Mesh(turretGeo, turretMat);
        turretBarrel.position.x = TURRET_LENGTH / 2; // offset so barrel base is at pivot

        // Pivot at top center of tank body - rotation sets firing direction
        const turretPivot = new THREE.Group();
        turretPivot.position.set(0, TANK_HEIGHT, 0); // top of body
        turretPivot.rotation.z = this.angle * Math.PI / 180; // 0=right, 90=up
        turretPivot.add(turretBarrel);

        // Health bar above tank (shows damage for all tanks, especially AI)
        const healthBarGroup = new THREE.Group();
        healthBarGroup.position.set(0, TANK_HEIGHT + 0.35, 0.5);
        const backGeo = new THREE.PlaneGeometry(HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
        const backMat = new THREE.MeshBasicMaterial({
            color: 0x333333,
            side: THREE.DoubleSide
        });
        const back = new THREE.Mesh(backGeo, backMat);
        back.renderOrder = 500;
        healthBarGroup.add(back);
        this._healthBarBack = back;

        const fillGeo = new THREE.PlaneGeometry(HEALTH_BAR_WIDTH, HEALTH_BAR_HEIGHT);
        const fillMat = new THREE.MeshBasicMaterial({
            color: 0x2ecc71,
            side: THREE.DoubleSide
        });
        const fill = new THREE.Mesh(fillGeo, fillMat);
        fill.position.z = 0.01; // in front of back
        fill.renderOrder = 501;
        healthBarGroup.add(fill);
        this._healthBarFill = fill;
        this._updateHealthBar();

        const group = new THREE.Group();
        group.add(body);
        group.add(turretPivot);
        group.add(healthBarGroup);
        group.position.set(this.position.x, this.position.y, 0);

        this._mesh = group;
        this._bodyMesh = body;
        this._turretPivot = turretPivot;
        return group;
    }

    /** Update mesh position, turret angle, and health bar. */
    updateMesh(terrain) {
        if (!this._mesh) return;
        const y = terrain.getHeight(this.position.x);
        this.position.y = y;
        this._mesh.position.set(this.position.x, this.position.y, 0);

        if (this._turretPivot) {
            this._turretPivot.rotation.z = this.angle * Math.PI / 180;
        }
        this._updateHealthBar();
    }

    /** Update health bar fill and color. */
    _updateHealthBar() {
        if (!this._healthBarFill || !this.alive) return;
        const ratio = Math.max(0, Math.min(1, this.health / DEFAULT_HEALTH));
        this._healthBarFill.scale.x = ratio;
        this._healthBarFill.position.x = -HEALTH_BAR_WIDTH / 2 * (1 - ratio);
        this._healthBarFill.material.color.setHex(
            ratio > 0.6 ? 0x2ecc71 : ratio > 0.3 ? 0xf1c40f : 0xe74c3c
        );
    }

    /** Get the mesh for adding to scene. */
    getMesh() {
        if (!this._mesh) this.createMesh();
        return this._mesh;
    }

    /** Remove from scene. */
    destroy() {
        if (this._mesh?.parent) {
            this._mesh.parent.remove(this._mesh);
        }
        this._mesh?.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) o.material.dispose();
        });
    }
}

/**
 * Spawn tanks randomly on terrain without overlap.
 * @param {TerrainSystem} terrain
 * @param {number} count - Number of tanks
 * @param {number} minSpacing - Minimum x distance between tanks
 * @returns {Tank[]}
 */
export function spawnTanks(terrain, count, minSpacing = 4) {
    const tanks = [];
    const halfWidth = terrain.width / 2;
    const margin = 3;
    const minX = -halfWidth + margin;
    const maxX = halfWidth - margin;

    const positions = [];
    let attempts = 0;
    const maxAttempts = 200;

    while (positions.length < count && attempts < maxAttempts) {
        attempts++;
        const x = minX + Math.random() * (maxX - minX);
        const valid = positions.every(p => Math.abs(p - x) >= minSpacing);
        if (valid) {
            positions.push(x);
        }
    }

    positions.sort((a, b) => a - b);

    for (let i = 0; i < positions.length; i++) {
        const x = positions[i];
        const y = terrain.getHeight(x);
        const tank = new Tank({
            x, y,
            isPlayer: i === 0,
            index: i
        });
        tanks.push(tank);
    }

    return tanks;
}
