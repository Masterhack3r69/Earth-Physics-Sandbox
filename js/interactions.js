/**
 * Material Interactions for Earth Physics Sandbox
 * Handles chemical reactions and material transformations
 */

import { MATERIAL, MATERIALS, STATE, getMaterial } from './materials.js';

export class InteractionsEngine {
    constructor(simulation) {
        this.sim = simulation;
    }

    /**
     * Check and handle interactions for a cell
     */
    update(x, y) {
        const cell = this.sim.getCell(x, y);
        if (cell.id === MATERIAL.AIR) return false;
        
        const mat = getMaterial(cell.id);
        let changed = false;

        // Check neighbors
        const neighbors = this.getNeighbors(x, y);
        
        // Check each possible interaction
        changed = this.checkMelting(x, y, cell, mat, neighbors) || changed;
        changed = this.checkBurning(x, y, cell, mat, neighbors) || changed;
        changed = this.checkMixing(x, y, cell, mat, neighbors) || changed;
        changed = this.checkGrowing(x, y, cell, mat, neighbors) || changed;
        changed = this.checkConduction(x, y, cell, mat, neighbors) || changed;
        changed = this.checkErosion(x, y, cell, mat, neighbors) || changed;
        
        return changed;
    }

    /**
     * Get all 8 neighbors of a cell
     */
    getNeighbors(x, y) {
        return {
            above: this.sim.getCell(x, y - 1),
            below: this.sim.getCell(x, y + 1),
            left: this.sim.getCell(x - 1, y),
            right: this.sim.getCell(x + 1, y),
            aboveLeft: this.sim.getCell(x - 1, y - 1),
            aboveRight: this.sim.getCell(x + 1, y - 1),
            belowLeft: this.sim.getCell(x - 1, y + 1),
            belowRight: this.sim.getCell(x + 1, y + 1)
        };
    }

    /**
     * Check for melting/freezing (ice <-> water, water -> steam)
     */
    checkMelting(x, y, cell, mat, neighbors) {
        // Ice melting
        if (cell.id === MATERIAL.ICE) {
            // Check for nearby heat sources
            for (const neighbor of Object.values(neighbors)) {
                const neighborMat = getMaterial(neighbor.id);
                if (neighborMat.temperature > mat.meltTemp + 50 || 
                    neighbor.id === MATERIAL.FIRE || 
                    neighbor.id === MATERIAL.LAVA) {
                    if (Math.random() < 0.05) {
                        this.sim.setCell(x, y, MATERIAL.WATER);
                        return true;
                    }
                }
            }
        }
        
        // Water evaporating near heat
        if (cell.id === MATERIAL.WATER) {
            for (const neighbor of Object.values(neighbors)) {
                if (neighbor.id === MATERIAL.FIRE || neighbor.id === MATERIAL.LAVA) {
                    if (Math.random() < 0.1) {
                        this.sim.setCell(x, y, MATERIAL.STEAM);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Check for burning/ignition
     */
    checkBurning(x, y, cell, mat, neighbors) {
        if (!mat.flammable) return false;
        
        // Check for fire or ignition sources
        let ignitionSource = false;
        for (const neighbor of Object.values(neighbors)) {
            const neighborMat = getMaterial(neighbor.id);
            if (neighborMat.ignites || neighbor.id === MATERIAL.FIRE) {
                ignitionSource = true;
                break;
            }
        }
        
        if (!ignitionSource) return false;
        
        // Different burn behaviors
        switch (cell.id) {
            case MATERIAL.WOOD:
                if (Math.random() < 0.02) {
                    // Wood burns to fire first, then becomes charcoal
                    this.sim.setCell(x, y, MATERIAL.FIRE);
                    // Spawn charcoal below sometimes
                    if (Math.random() < 0.3) {
                        const below = neighbors.below;
                        if (below.id === MATERIAL.AIR) {
                            this.sim.setCell(x, y + 1, MATERIAL.CHARCOAL);
                        }
                    }
                    return true;
                }
                break;
                
            case MATERIAL.OIL:
                if (Math.random() < 0.15) {
                    this.sim.setCell(x, y, MATERIAL.FIRE);
                    return true;
                }
                break;
                
            case MATERIAL.GAS:
                if (Math.random() < 0.5) {
                    // Gas explodes!
                    this.sim.setCell(x, y, MATERIAL.EXPLOSION);
                    return true;
                }
                break;
                
            case MATERIAL.GRASS:
            case MATERIAL.PLANT:
                if (Math.random() < 0.05) {
                    this.sim.setCell(x, y, MATERIAL.FIRE);
                    return true;
                }
                break;
                
            case MATERIAL.CHARCOAL:
                if (Math.random() < 0.01) {
                    this.sim.setCell(x, y, MATERIAL.FIRE);
                    return true;
                }
                break;
        }
        
        return false;
    }

    /**
     * Check for material mixing/reactions
     */
    checkMixing(x, y, cell, mat, neighbors) {
        // Sand + Water = Mud
        if (cell.id === MATERIAL.SAND) {
            for (const neighbor of Object.values(neighbors)) {
                if (neighbor.id === MATERIAL.WATER) {
                    if (Math.random() < 0.05) {
                        this.sim.setCell(x, y, MATERIAL.MUD);
                        return true;
                    }
                }
            }
        }
        
        // Dirt + Water = Can spawn grass on top
        if (cell.id === MATERIAL.DIRT) {
            const above = neighbors.above;
            if (above.id === MATERIAL.AIR) {
                let hasWater = false;
                for (const neighbor of Object.values(neighbors)) {
                    if (neighbor.id === MATERIAL.WATER) {
                        hasWater = true;
                        break;
                    }
                }
                if (hasWater && Math.random() < 0.001) {
                    this.sim.setCell(x, y - 1, MATERIAL.GRASS);
                    return true;
                }
            }
        }
        
        // Lava + Water = Stone + Steam
        if (cell.id === MATERIAL.LAVA) {
            for (const [key, neighbor] of Object.entries(neighbors)) {
                if (neighbor.id === MATERIAL.WATER) {
                    if (Math.random() < 0.3) {
                        this.sim.setCell(x, y, MATERIAL.STONE);
                        // Replace water with steam
                        const nx = key.includes('Left') ? x - 1 : key.includes('Right') ? x + 1 : x;
                        const ny = key.includes('above') ? y - 1 : key.includes('below') ? y + 1 : y;
                        this.sim.setCell(nx, ny, MATERIAL.STEAM);
                        return true;
                    }
                }
            }
        }
        
        // Water + Lava = Stone + Steam (from water's perspective too)
        if (cell.id === MATERIAL.WATER) {
            for (const [key, neighbor] of Object.entries(neighbors)) {
                if (neighbor.id === MATERIAL.LAVA) {
                    if (Math.random() < 0.3) {
                        this.sim.setCell(x, y, MATERIAL.STEAM);
                        return true;
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Check for growing (grass, plants)
     */
    checkGrowing(x, y, cell, mat, neighbors) {
        // Grass spreads on dirt
        if (cell.id === MATERIAL.GRASS) {
            if (Math.random() < 0.002) {
                const dirs = [
                    { dx: -1, dy: 0 },
                    { dx: 1, dy: 0 },
                    { dx: 0, dy: 1 }
                ];
                for (const { dx, dy } of dirs) {
                    const neighbor = this.sim.getCell(x + dx, y + dy);
                    const above = this.sim.getCell(x + dx, y + dy - 1);
                    if (neighbor.id === MATERIAL.DIRT && above.id === MATERIAL.AIR) {
                        this.sim.setCell(x + dx, y + dy - 1, MATERIAL.GRASS);
                        return true;
                    }
                }
            }
        }
        
        // Plants grow upward
        if (cell.id === MATERIAL.PLANT) {
            const above = neighbors.above;
            if (above.id === MATERIAL.AIR && Math.random() < 0.001) {
                // Check for water nearby
                let hasWater = false;
                for (const neighbor of Object.values(neighbors)) {
                    if (neighbor.id === MATERIAL.WATER) {
                        hasWater = true;
                        break;
                    }
                }
                if (hasWater) {
                    this.sim.setCell(x, y - 1, MATERIAL.PLANT);
                    return true;
                }
            }
        }
        
        return false;
    }

    /**
     * Check for electrical conduction
     */
    checkConduction(x, y, cell, mat, neighbors) {
        // Electricity spreads through conductive materials
        if (cell.id === MATERIAL.ELECTRICITY) {
            for (const [key, neighbor] of Object.entries(neighbors)) {
                const neighborMat = getMaterial(neighbor.id);
                if (neighborMat.conductive && neighbor.id !== MATERIAL.ELECTRICITY) {
                    if (Math.random() < 0.5) {
                        const nx = key.includes('Left') ? x - 1 : key.includes('Right') ? x + 1 : x;
                        const ny = key.includes('above') ? y - 1 : key.includes('below') ? y + 1 : y;
                        
                        // Chance to spawn new electricity or damage
                        if (Math.random() < 0.3) {
                            // Store original material and create spark effect
                            const origId = neighbor.id;
                            this.sim.setCell(nx, ny, MATERIAL.ELECTRICITY);
                        }
                    }
                }
            }
        }
        
        return false;
    }

    /**
     * Check for erosion (water erodes sand/dirt)
     */
    checkErosion(x, y, cell, mat, neighbors) {
        if (cell.id === MATERIAL.WATER) {
            // Erode sand and dirt
            for (const [key, neighbor] of Object.entries(neighbors)) {
                if (neighbor.id === MATERIAL.SAND || neighbor.id === MATERIAL.DIRT) {
                    if (Math.random() < 0.0005) { // Very slow erosion
                        const nx = key.includes('Left') ? x - 1 : key.includes('Right') ? x + 1 : x;
                        const ny = key.includes('above') ? y - 1 : key.includes('below') ? y + 1 : y;
                        
                        if (neighbor.id === MATERIAL.SAND) {
                            this.sim.setCell(nx, ny, MATERIAL.MUD);
                        } else {
                            this.sim.setCell(nx, ny, MATERIAL.MUD);
                        }
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
}
