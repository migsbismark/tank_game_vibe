/**
 * Tank Artillery Game - Turn Manager
 * Phase 8: Turn order, round-robin, skip destroyed tanks
 */

export class TurnManager {
    /**
     * @param {Tank[]} tanks
     */
    constructor(tanks) {
        this.tanks = tanks;
        this.currentIndex = 0;
    }

    /** Get current active tank (skips dead). */
    getCurrentTank() {
        let checked = 0;
        while (checked < this.tanks.length) {
            const t = this.tanks[this.currentIndex];
            if (t && t.alive) return t;
            this.currentIndex = (this.currentIndex + 1) % this.tanks.length;
            checked++;
        }
        return null;
    }

    /** Advance to next tank. */
    next() {
        this.currentIndex = (this.currentIndex + 1) % this.tanks.length;
    }

    /** Reset to first tank. */
    reset() {
        this.currentIndex = 0;
    }

    /** Count alive tanks. */
    aliveCount() {
        return this.tanks.filter(t => t.alive).length;
    }
}
