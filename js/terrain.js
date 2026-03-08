/**
 * Tank Artillery Game - Terrain System
 * Phase 2: Heightmap data structure, mesh rendering, random generation
 */

import * as THREE from 'three';

/**
 * Terrain system: heightmap-based 2D terrain with configurable width and resolution.
 */
export class TerrainSystem {
    /**
     * @param {Object} config
     * @param {number} config.width - Total terrain width in world units
     * @param {number} config.resolution - Number of height samples (segments + 1)
     * @param {number} [config.baseHeight=5] - Base terrain height
     * @param {number} [config.minHeight=0] - Minimum allowed height
     */
    constructor(config = {}) {
        this.width = config.width ?? 40;
        this.resolution = Math.max(2, config.resolution ?? 100);
        this.baseHeight = config.baseHeight ?? 5;
        this.minHeight = config.minHeight ?? 0;

        /** @type {number[]} Height at each sample index. heightmap[i] = height at x = (i / (resolution-1)) * width - width/2 */
        this.heightmap = [];
        this._mesh = null;
    }

    /**
     * Get terrain height at world x (linear interpolation between samples).
     * @param {number} x - World x coordinate
     * @returns {number} Terrain height at x
     */
    getHeight(x) {
        if (this.heightmap.length === 0) return this.baseHeight;

        const halfWidth = this.width / 2;
        const normalized = (x + halfWidth) / this.width; // 0..1
        const index = normalized * (this.resolution - 1);

        if (index <= 0) return this.heightmap[0];
        if (index >= this.resolution - 1) return this.heightmap[this.resolution - 1];

        const i0 = Math.floor(index);
        const i1 = Math.min(i0 + 1, this.resolution - 1);
        const t = index - i0;
        return this.heightmap[i0] * (1 - t) + this.heightmap[i1] * t;
    }

    /**
     * Get world x for a heightmap index.
     * @param {number} index - Heightmap array index
     * @returns {number} World x coordinate
     */
    getX(index) {
        const halfWidth = this.width / 2;
        return (index / (this.resolution - 1)) * this.width - halfWidth;
    }

    /**
     * Generate random terrain with hills and valleys. Smoothed to avoid vertical walls.
     */
    generate() {
        this.heightmap = [];
        const maxVariation = 4;
        const smoothPasses = 2;

        for (let i = 0; i < this.resolution; i++) {
            const variation = (Math.random() - 0.5) * 2 * maxVariation;
            let h = this.baseHeight + variation;
            h = Math.max(this.minHeight, h);
            this.heightmap.push(h);
        }

        for (let p = 0; p < smoothPasses; p++) {
            const smoothed = [...this.heightmap];
            for (let i = 1; i < this.resolution - 1; i++) {
                smoothed[i] = (this.heightmap[i - 1] + this.heightmap[i] * 2 + this.heightmap[i + 1]) / 4;
                smoothed[i] = Math.max(this.minHeight, smoothed[i]);
            }
            this.heightmap = smoothed;
        }
    }

    /**
     * Create or update Three.js mesh from heightmap.
     * @returns {THREE.Mesh} Terrain mesh for side view (XY plane)
     */
    createMesh() {
        const parent = this._mesh?.parent;
        if (this._mesh) {
            this._mesh.geometry.dispose();
            this._mesh.parent?.remove(this._mesh);
        }

        const halfWidth = this.width / 2;
        const shape = new THREE.Shape();

        shape.moveTo(-halfWidth, this.minHeight - 2);
        for (let i = 0; i < this.resolution; i++) {
            const x = this.getX(i);
            const y = this.heightmap[i];
            shape.lineTo(x, y);
        }
        shape.lineTo(halfWidth, this.minHeight - 2);
        shape.closePath();

        const extrudeSettings = { depth: 1, bevelEnabled: false };
        const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        // Keep shape in XY plane for side-view camera (no rotation needed)

        const material = new THREE.MeshBasicMaterial({
            color: 0x228b22,
            side: THREE.DoubleSide
        });
        this._mesh = new THREE.Mesh(geometry, material);
        if (parent) parent.add(this._mesh);
        return this._mesh;
    }

    /**
     * Get the terrain mesh (creates if not yet built).
     * @returns {THREE.Mesh}
     */
    getMesh() {
        if (!this._mesh) {
            this.createMesh();
        }
        return this._mesh;
    }

    /**
     * Check if x is within terrain bounds.
     * @param {number} x
     * @returns {boolean}
     */
    isInBounds(x) {
        const halfWidth = this.width / 2;
        return x >= -halfWidth && x <= halfWidth;
    }

    /**
     * Deform terrain with explosion crater.
     * @param {number} centerX - Explosion center x
     * @param {number} radius - Explosion radius
     * @param {number} power - Deformation strength
     */
    deformTerrain(centerX, radius, power) {
        for (let i = 0; i < this.resolution; i++) {
            const x = this.getX(i);
            const dx = x - centerX;
            const distance = Math.abs(dx);
            if (distance >= radius) continue;
            const factor = 1 - distance / radius;
            const deformation = power * factor;
            this.heightmap[i] = Math.max(this.minHeight, this.heightmap[i] - deformation);
        }
        this.createMesh();
    }
}
