/**
 * Tank Artillery Game - Explosion System
 * Phase 7: Explosion effect, damage, terrain deformation, tank destruction
 */

import * as THREE from 'three';

const EXPLOSION_RADIUS = 3;
const EXPLOSION_POWER = 2;
const MAX_DAMAGE = 50;
const PARTICLE_COUNT = 24;
const PARTICLE_DURATION = 0.5;

/**
 * Create explosion visual (particles).
 * @param {THREE.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 * @returns {THREE.Group} - Remove after duration
 */
export function createExplosionEffect(scene, x, y, radius = EXPLOSION_RADIUS) {
    const group = new THREE.Group();
    group.position.set(x, y, 0);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        const geo = new THREE.SphereGeometry(0.15, 4, 4);
        const mat = new THREE.MeshBasicMaterial({
            color: Math.random() > 0.5 ? 0xff6600 : 0xffaa00
        });
        const p = new THREE.Mesh(geo, mat);
        const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + Math.random();
        const speed = 3 + Math.random() * 5;
        p.userData = {
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: PARTICLE_DURATION
        };
        group.add(p);
    }

    group.userData = { life: PARTICLE_DURATION };
    scene.add(group);
    return group;
}

/**
 * Update explosion particles (call each frame).
 * @param {THREE.Group} group
 * @param {number} dt
 * @returns {boolean} - true if still active
 */
export function updateExplosionParticles(group, dt) {
    if (!group || !group.userData) return false;
    group.userData.life = (group.userData.life ?? PARTICLE_DURATION) - dt;
    if (group.userData.life <= 0) return false;

    group.children.forEach(p => {
        if (p.userData) {
            p.position.x += p.userData.vx * dt;
            p.position.y += p.userData.vy * dt;
            p.userData.vy -= 8 * dt;
        }
    });
    return true;
}

/**
 * Apply damage to tanks within radius.
 * @param {Tank[]} tanks
 * @param {number} centerX
 * @param {number} centerY
 * @param {number} radius
 * @param {number} maxDamage
 */
export function applyExplosionDamage(tanks, centerX, centerY, radius, maxDamage = MAX_DAMAGE) {
    tanks.forEach(t => {
        if (!t.alive) return;
        const dx = t.position.x - centerX;
        const dy = t.position.y - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist >= radius) return;
        const factor = 1 - dist / radius;
        const damage = maxDamage * factor;
        t.health -= damage;
        if (t.health <= 0) t.alive = false;
    });
}

/**
 * Trigger explosion: damage, terrain deform, effect.
 */
export function triggerExplosion(scene, terrain, tanks, x, y, options = {}) {
    const radius = options.radius ?? EXPLOSION_RADIUS;
    const power = options.power ?? EXPLOSION_POWER;
    const maxDamage = options.maxDamage ?? MAX_DAMAGE;

    applyExplosionDamage(tanks, x, y, radius, maxDamage);
    terrain.deformTerrain(x, radius, power);
    return createExplosionEffect(scene, x, y, radius);
}
