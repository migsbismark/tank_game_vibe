/**
 * Tank Artillery Game - Projectile System
 * Phase 5: Projectile object, physics, firing
 */

import * as THREE from 'three';

const GRAVITY = 15;
const PROJECTILE_RADIUS = 0.2;

/**
 * Projectile with position and velocity. Physics: gravity, position update.
 */
export class Projectile {
    /**
     * @param {number} x - Start x
     * @param {number} y - Start y
     * @param {number} vx - Initial velocity x
     * @param {number} vy - Initial velocity y
     */
    constructor(x, y, vx, vy) {
        this.position = { x, y };
        this.spawnPosition = { x, y }; // where we spawned - for distance-based grace
        this.velocity = { x: vx, y: vy };
        this.active = true;
        this.age = 0;
        this._mesh = null;
    }

    /** Create sphere mesh - bright color, rendered on top for visibility. */
    createMesh() {
        const geo = new THREE.SphereGeometry(PROJECTILE_RADIUS, 16, 16);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            transparent: false
        });
        this._mesh = new THREE.Mesh(geo, mat);
        this._mesh.position.set(this.position.x, this.position.y, 1); // z=1 so in front of terrain
        this._mesh.renderOrder = 1000; // render on top
        return this._mesh;
    }

    /** Update position from velocity and gravity. */
    update(dt) {
        if (!this.active) return;
        this.age += dt;
        this.velocity.y -= GRAVITY * dt;
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;
        if (this._mesh) {
            this._mesh.position.set(this.position.x, this.position.y, 1);
        }
    }

    getMesh() {
        if (!this._mesh) this.createMesh();
        return this._mesh;
    }

    destroy() {
        this.active = false;
        if (this._mesh?.parent) this._mesh.parent.remove(this._mesh);
        this._mesh?.traverse(o => {
            if (o.geometry) o.geometry.dispose();
            if (o.material) o.material.dispose();
        });
    }
}

/**
 * Convert angle (degrees) and power to velocity.
 * Angle: 0 = right, 90 = up.
 */
export function anglePowerToVelocity(angleDeg, power) {
    const rad = (angleDeg * Math.PI) / 180;
    return {
        x: power * Math.cos(rad),
        y: power * Math.sin(rad)
    };
}
