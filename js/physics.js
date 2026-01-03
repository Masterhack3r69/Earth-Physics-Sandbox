/**
 * Physics Engine for Earth Physics Sandbox
 * Improved logic to prevent chaotic mixing
 */

import { MATERIAL, MATERIALS, STATE, getMaterial } from './materials.js';

export class PhysicsEngine {
    constructor(simulation) {
        this.sim = simulation;
    }

    /**
     * Update physics for a single cell
     */
    update(x, y) {
        const cell = this.sim.getCell(x, y);
        if (cell.id === MATERIAL.AIR) return false;
        
        // Mark as updated this frame to prevent double-processing
        if (cell.updated === this.sim.frameCount) return false;
        
        const mat = getMaterial(cell.id);
        
        // Skip immovable solids
        if (mat.immovable) return false;
        
        // Update based on material state
        let moved = false;
        switch (mat.state) {
            case STATE.POWDER:
                moved = this.updatePowder(x, y, cell, mat);
                break;
            case STATE.LIQUID:
                moved = this.updateLiquid(x, y, cell, mat);
                break;
            case STATE.GAS:
                moved = this.updateGas(x, y, cell, mat);
                break;
            case STATE.ENERGY:
                moved = this.updateEnergy(x, y, cell, mat);
                break;
            case STATE.SOLID:
                moved = this.updateSolid(x, y, cell, mat);
                break;
        }
        
        return moved;
    }

    /**
     * Powder physics (sand, dirt, charcoal)
     * Falls down, piles at natural angle of repose
     */
    updatePowder(x, y, cell, mat) {
        const below = this.sim.getCell(x, y + 1);
        const belowMat = getMaterial(below.id);
        
        // Fall straight down into air
        if (below.id === MATERIAL.AIR) {
            this.sim.swap(x, y, x, y + 1);
            return true;
        }
        
        // Fall through less dense liquids (sink)
        if (belowMat.state === STATE.LIQUID && mat.density > belowMat.density) {
            // Slow sinking through liquid
            if (Math.random() < 0.4) {
                this.sim.swap(x, y, x, y + 1);
                return true;
            }
            return false;
        }
        
        // Try to slide diagonally (natural angle of repose)
        // Check both sides are clear before falling
        const dir = Math.random() < 0.5 ? 1 : -1;
        
        // First try: preferred direction
        if (this.tryPowderSlide(x, y, dir, cell, mat)) return true;
        
        // Second try: opposite direction
        if (this.tryPowderSlide(x, y, -dir, cell, mat)) return true;
        
        return false;
    }

    /**
     * Try to slide powder diagonally
     */
    tryPowderSlide(x, y, dir, cell, mat) {
        const side = this.sim.getCell(x + dir, y);
        const sideMat = getMaterial(side.id);
        const diag = this.sim.getCell(x + dir, y + 1);
        const diagMat = getMaterial(diag.id);
        
        // Can only slide if diagonal is open (air or less dense liquid)
        const diagOpen = diag.id === MATERIAL.AIR || 
            (diagMat.state === STATE.LIQUID && mat.density > diagMat.density);
        
        // Side must be passable (air or gas)
        const sideOpen = side.id === MATERIAL.AIR || sideMat.state === STATE.GAS;
        
        if (diagOpen && sideOpen) {
            this.sim.swap(x, y, x + dir, y + 1);
            return true;
        }
        
        return false;
    }

    /**
     * Liquid physics (water, oil, lava, mud)
     * Falls and spreads horizontally to equalize
     */
    updateLiquid(x, y, cell, mat) {
        const viscosity = mat.viscosity || 1;
        
        // Higher viscosity = slower updates
        if (viscosity > 1 && Math.random() > 1 / viscosity) {
            return false;
        }
        
        const below = this.sim.getCell(x, y + 1);
        const belowMat = getMaterial(below.id);
        
        // Fall straight down into air
        if (below.id === MATERIAL.AIR) {
            this.sim.swap(x, y, x, y + 1);
            return true;
        }
        
        // Sink through less dense liquids
        if (belowMat.state === STATE.LIQUID && mat.density > belowMat.density) {
            if (Math.random() < 0.5) {
                this.sim.swap(x, y, x, y + 1);
                return true;
            }
        }
        
        // Float up through denser liquids
        if (belowMat.state === STATE.LIQUID && mat.density < belowMat.density) {
            const above = this.sim.getCell(x, y - 1);
            if (above.id === MATERIAL.AIR || 
                (getMaterial(above.id).state === STATE.LIQUID && getMaterial(above.id).density > mat.density)) {
                // Don't swap with below, try to push up
            }
        }
        
        // Try to fall diagonally
        const dir = Math.random() < 0.5 ? 1 : -1;
        
        const diag1 = this.sim.getCell(x + dir, y + 1);
        if (diag1.id === MATERIAL.AIR) {
            this.sim.swap(x, y, x + dir, y + 1);
            return true;
        }
        
        const diag2 = this.sim.getCell(x - dir, y + 1);
        if (diag2.id === MATERIAL.AIR) {
            this.sim.swap(x, y, x - dir, y + 1);
            return true;
        }
        
        // Spread horizontally only if supported (can't fall further)
        // This prevents excessive mixing
        const canSpread = belowMat.state === STATE.SOLID || 
                          belowMat.state === STATE.POWDER ||
                          (belowMat.state === STATE.LIQUID && mat.density <= belowMat.density);
        
        if (canSpread) {
            // Try to flow to where there's more room
            const left = this.sim.getCell(x - 1, y);
            const right = this.sim.getCell(x + 1, y);
            
            const canLeft = left.id === MATERIAL.AIR;
            const canRight = right.id === MATERIAL.AIR;
            
            if (canLeft && canRight) {
                this.sim.swap(x, y, x + dir, y);
                return true;
            } else if (canLeft) {
                this.sim.swap(x, y, x - 1, y);
                return true;
            } else if (canRight) {
                this.sim.swap(x, y, x + 1, y);
                return true;
            }
            
            // Pressure equalization - flow toward lower liquid levels
            if (Math.random() < 0.3) {
                const leftBelow = this.sim.getCell(x - 2, y + 1);
                const rightBelow = this.sim.getCell(x + 2, y + 1);
                
                if (leftBelow.id === MATERIAL.AIR && left.id === cell.id) {
                    this.sim.swap(x, y, x - 1, y);
                    return true;
                }
                if (rightBelow.id === MATERIAL.AIR && right.id === cell.id) {
                    this.sim.swap(x, y, x + 1, y);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Gas physics (steam, smoke)
     * Rises up and disperses
     */
    updateGas(x, y, cell, mat) {
        // Handle lifetime/dissipation
        if (mat.lifetime) {
            cell.life = (cell.life || mat.lifetime) - 1;
            if (cell.life <= 0) {
                if (mat.dissipates) {
                    this.sim.setCell(x, y, MATERIAL.AIR);
                    return true;
                } else if (mat.condensesTo) {
                    this.sim.setCell(x, y, mat.condensesTo);
                    return true;
                }
                this.sim.setCell(x, y, MATERIAL.AIR);
                return true;
            }
        }
        
        // Rise up
        const above = this.sim.getCell(x, y - 1);
        if (above.id === MATERIAL.AIR) {
            if (Math.random() < 0.8) {
                this.sim.swap(x, y, x, y - 1);
                return true;
            }
        }
        
        // Rise diagonally
        const dir = Math.random() < 0.5 ? 1 : -1;
        const diagUp1 = this.sim.getCell(x + dir, y - 1);
        const diagUp2 = this.sim.getCell(x - dir, y - 1);
        
        if (diagUp1.id === MATERIAL.AIR && Math.random() < 0.5) {
            this.sim.swap(x, y, x + dir, y - 1);
            return true;
        }
        if (diagUp2.id === MATERIAL.AIR && Math.random() < 0.5) {
            this.sim.swap(x, y, x - dir, y - 1);
            return true;
        }
        
        // Spread sideways slowly
        if (Math.random() < 0.2) {
            const side = this.sim.getCell(x + dir, y);
            if (side.id === MATERIAL.AIR) {
                this.sim.swap(x, y, x + dir, y);
                return true;
            }
        }
        
        return false;
    }

    /**
     * Energy physics (fire, electricity, explosion)
     */
    updateEnergy(x, y, cell, mat) {
        // Reduce lifetime
        cell.life = (cell.life || mat.lifetime) - 1;
        
        if (cell.life <= 0) {
            if (mat.produces) {
                this.sim.setCell(x, y, mat.produces);
            } else {
                this.sim.setCell(x, y, MATERIAL.AIR);
            }
            return true;
        }
        
        // Fire flickers upward
        if (cell.id === MATERIAL.FIRE) {
            if (Math.random() < 0.4) {
                const above = this.sim.getCell(x, y - 1);
                if (above.id === MATERIAL.AIR) {
                    this.sim.swap(x, y, x, y - 1);
                    return true;
                }
            }
            // Random horizontal flicker
            if (Math.random() < 0.15) {
                const dir = Math.random() < 0.5 ? 1 : -1;
                const side = this.sim.getCell(x + dir, y);
                if (side.id === MATERIAL.AIR) {
                    this.sim.swap(x, y, x + dir, y);
                    return true;
                }
            }
        }
        
        // Explosion force
        if (cell.id === MATERIAL.EXPLOSION) {
            const force = mat.force || 5;
            for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                    if (dx === 0 && dy === 0) continue;
                    const nx = x + dx;
                    const ny = y + dy;
                    const neighbor = this.sim.getCell(nx, ny);
                    const neighborMat = getMaterial(neighbor.id);
                    
                    if (!neighborMat.immovable && neighbor.id !== MATERIAL.EXPLOSION && neighbor.id !== MATERIAL.AIR) {
                        // Push material outward
                        const pushX = x + dx * 2;
                        const pushY = y + dy * 2;
                        if (this.sim.inBounds(pushX, pushY)) {
                            const target = this.sim.getCell(pushX, pushY);
                            if (target.id === MATERIAL.AIR) {
                                this.sim.swap(nx, ny, pushX, pushY);
                            }
                        }
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Solid physics (ice, wood - movable solids)
     */
    updateSolid(x, y, cell, mat) {
        if (mat.immovable) return false;
        
        const below = this.sim.getCell(x, y + 1);
        const belowMat = getMaterial(below.id);
        
        // Fall into air
        if (below.id === MATERIAL.AIR) {
            this.sim.swap(x, y, x, y + 1);
            return true;
        }
        
        // Float on very dense liquids
        if (belowMat.state === STATE.LIQUID) {
            if (mat.density < belowMat.density) {
                // Stay floating, don't move
                return false;
            } else {
                // Sink slowly
                if (Math.random() < 0.15) {
                    this.sim.swap(x, y, x, y + 1);
                    return true;
                }
            }
        }
        
        return false;
    }
}
