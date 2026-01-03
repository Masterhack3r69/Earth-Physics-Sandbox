/**
 * Core Simulation for Earth Physics Sandbox
 * Optimized for performance with faster physics
 */

import { MATERIAL, MATERIALS, getMaterial, getColor } from './materials.js';
import { PhysicsEngine } from './physics.js';
import { InteractionsEngine } from './interactions.js';

export class Simulation {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new Array(width * height);
        this.colorCache = new Uint8ClampedArray(width * height * 4);
        this.physics = new PhysicsEngine(this);
        this.interactions = new InteractionsEngine(this);
        
        // Track which cells have dynamic materials for optimized color updates
        this.dynamicCells = new Set();
        
        // Simulation state
        this.paused = true;
        this.speed = 1;
        this.ticksPerFrame = 1;
        this.frameCount = 0;
        this.particleCount = 0;
        
        // Initialize grid with air
        this.reset();
    }

    /**
     * Reset the simulation to empty state
     */
    reset() {
        for (let i = 0; i < this.grid.length; i++) {
            this.grid[i] = { id: MATERIAL.AIR, life: 0, temperature: 20 };
        }
        this.particleCount = 0;
        this.dynamicCells.clear();
        this.updateColorCache();
    }

    /**
     * Get cell at position - inlined for performance
     */
    getCell(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return { id: MATERIAL.STONE, immovable: true };
        }
        return this.grid[y * this.width + x];
    }

    /**
     * Set cell at position - optimized
     */
    setCell(x, y, materialId, props = {}) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        
        const idx = y * this.width + x;
        const oldId = this.grid[idx].id;
        
        // Update particle count
        if (oldId === MATERIAL.AIR && materialId !== MATERIAL.AIR) {
            this.particleCount++;
        } else if (oldId !== MATERIAL.AIR && materialId === MATERIAL.AIR) {
            this.particleCount--;
        }
        
        const mat = getMaterial(materialId);
        this.grid[idx] = {
            id: materialId,
            life: mat.lifetime || 0,
            temperature: mat.temperature || 20,
            ...props
        };
        
        // Track dynamic materials
        if (typeof mat.color === 'function') {
            this.dynamicCells.add(idx);
        } else {
            this.dynamicCells.delete(idx);
        }
        
        // Update color cache
        const color = typeof mat.color === 'function' ? mat.color() : mat.color;
        const colorIdx = idx * 4;
        this.colorCache[colorIdx] = color[0];
        this.colorCache[colorIdx + 1] = color[1];
        this.colorCache[colorIdx + 2] = color[2];
        this.colorCache[colorIdx + 3] = 255;
    }

    /**
     * Swap two cells - optimized
     */
    swap(x1, y1, x2, y2) {
        if (x1 < 0 || x1 >= this.width || y1 < 0 || y1 >= this.height) return;
        if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) return;
        
        const idx1 = y1 * this.width + x1;
        const idx2 = y2 * this.width + x2;
        
        // Swap grid cells
        const temp = this.grid[idx1];
        this.grid[idx1] = this.grid[idx2];
        this.grid[idx2] = temp;
        
        // Swap colors in cache
        const colorIdx1 = idx1 * 4;
        const colorIdx2 = idx2 * 4;
        
        const r1 = this.colorCache[colorIdx1];
        const g1 = this.colorCache[colorIdx1 + 1];
        const b1 = this.colorCache[colorIdx1 + 2];
        
        this.colorCache[colorIdx1] = this.colorCache[colorIdx2];
        this.colorCache[colorIdx1 + 1] = this.colorCache[colorIdx2 + 1];
        this.colorCache[colorIdx1 + 2] = this.colorCache[colorIdx2 + 2];
        
        this.colorCache[colorIdx2] = r1;
        this.colorCache[colorIdx2 + 1] = g1;
        this.colorCache[colorIdx2 + 2] = b1;
        
        // Update dynamic cell tracking
        if (this.dynamicCells.has(idx1)) {
            this.dynamicCells.delete(idx1);
            this.dynamicCells.add(idx2);
        }
        if (this.dynamicCells.has(idx2)) {
            this.dynamicCells.delete(idx2);
            this.dynamicCells.add(idx1);
        }
    }

    /**
     * Check if position is in bounds - inlined
     */
    inBounds(x, y) {
        return x >= 0 && x < this.width && y >= 0 && y < this.height;
    }

    /**
     * Update color cache for a single cell
     */
    updateCellColor(x, y) {
        const idx = y * this.width + x;
        const cell = this.grid[idx];
        const color = getColor(cell.id);
        const colorIdx = idx * 4;
        this.colorCache[colorIdx] = color[0];
        this.colorCache[colorIdx + 1] = color[1];
        this.colorCache[colorIdx + 2] = color[2];
        this.colorCache[colorIdx + 3] = 255;
    }

    /**
     * Update entire color cache
     */
    updateColorCache() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.updateCellColor(x, y);
            }
        }
    }

    /**
     * Run one simulation tick - optimized
     */
    tick() {
        this.frameCount++;
        
        // Alternate direction for even distribution
        const leftToRight = this.frameCount % 2 === 0;
        
        // Process from bottom to top for gravity
        for (let y = this.height - 1; y >= 0; y--) {
            if (leftToRight) {
                for (let x = 0; x < this.width; x++) {
                    this.physics.update(x, y);
                }
            } else {
                for (let x = this.width - 1; x >= 0; x--) {
                    this.physics.update(x, y);
                }
            }
        }
        
        // Interactions less frequently for performance
        if (this.frameCount % 2 === 0) {
            for (let y = this.height - 1; y >= 0; y--) {
                for (let x = 0; x < this.width; x++) {
                    if ((x + y) % 3 === 0) {
                        this.interactions.update(x, y);
                    }
                }
            }
        }
        
        // Only update dynamic colors (fire, lava, etc.)
        this.updateDynamicColors();
    }

    /**
     * Update colors for animated materials - optimized
     */
    updateDynamicColors() {
        for (const idx of this.dynamicCells) {
            const cell = this.grid[idx];
            const mat = getMaterial(cell.id);
            
            if (typeof mat.color === 'function') {
                const color = mat.color();
                const colorIdx = idx * 4;
                this.colorCache[colorIdx] = color[0];
                this.colorCache[colorIdx + 1] = color[1];
                this.colorCache[colorIdx + 2] = color[2];
            }
        }
    }

    /**
     * Draw material with a brush
     */
    drawBrush(centerX, centerY, materialId, radius, shape = 'circle') {
        const radiusSq = radius * radius;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const x = centerX + dx;
                const y = centerY + dy;
                
                if (x < 0 || x >= this.width || y < 0 || y >= this.height) continue;
                
                if (shape === 'circle' && (dx * dx + dy * dy) > radiusSq) continue;
                
                // Slightly random for natural look
                if (Math.random() < 0.85) {
                    this.setCell(x, y, materialId);
                }
            }
        }
    }

    /**
     * Draw a line of material
     */
    drawLine(x0, y0, x1, y1, materialId, radius) {
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            this.drawBrush(x0, y0, materialId, radius);

            if (x0 === x1 && y0 === y1) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    /**
     * Get the color buffer for rendering
     */
    getColorBuffer() {
        return this.colorCache;
    }

    /**
     * Set simulation speed
     */
    setSpeed(speed) {
        this.speed = speed;
        this.ticksPerFrame = Math.max(1, Math.round(speed));
    }

    /**
     * Toggle pause state
     */
    togglePause() {
        this.paused = !this.paused;
        return this.paused;
    }

    /**
     * Step one frame when paused
     */
    step() {
        this.tick();
    }
}
