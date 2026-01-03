/**
 * Earth Physics Sandbox - Main Application
 * A falling-sand physics simulator with realistic material interactions
 */

import { Simulation } from './js/simulation.js';
import { Renderer } from './js/renderer.js';
import { UIController } from './js/ui.js';

class App {
    constructor() {
        // Larger grid dimensions for better visuals
        this.width = 320;
        this.height = 240;
        
        // Get canvas elements
        this.canvas = document.getElementById('simulation-canvas');
        this.overlay = document.getElementById('overlay-canvas');
        
        // Initialize core systems
        this.simulation = new Simulation(this.width, this.height);
        this.renderer = new Renderer(this.canvas, this.overlay, this.simulation);
        this.ui = new UIController(this.simulation, this.renderer);
        
        // Animation state
        this.lastTime = 0;
        this.frameCount = 0;
        this.fpsTime = 0;
        this.fps = 60;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // Resize handler
        this.handleResize();
        window.addEventListener('resize', () => this.handleResize());
        
        // Start the simulation running by default
        this.simulation.paused = false;
        // Update play button state
        setTimeout(() => {
            document.getElementById('icon-play').style.display = 'none';
            document.getElementById('icon-pause').style.display = 'block';
            document.getElementById('btn-play').classList.add('active');
        }, 100);
        
        // Start animation loop
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
        
        console.log('🌍 Earth Physics Sandbox initialized!');
    }

    /**
     * Handle window resize
     */
    handleResize() {
        const container = document.querySelector('.simulation-area');
        const maxWidth = container.clientWidth - 20;
        const maxHeight = container.clientHeight - 20;
        
        // Calculate scale to fit container - allow larger scaling
        const scaleX = maxWidth / this.width;
        const scaleY = maxHeight / this.height;
        const scale = Math.min(scaleX, scaleY, 4); // Allow up to 4x scale
        
        this.renderer.setScale(Math.max(1.5, scale));
    }

    /**
     * Main animation loop - optimized
     */
    animate(time) {
        // Calculate delta time
        const dt = time - this.lastTime;
        
        // FPS calculation
        this.frameCount++;
        this.fpsTime += dt;
        if (this.fpsTime >= 500) { // Update more frequently
            this.fps = this.frameCount * 1000 / this.fpsTime;
            this.frameCount = 0;
            this.fpsTime = 0;
            this.ui.updateStats(this.fps);
        }
        
        this.lastTime = time;
        
        // Run simulation if not paused
        if (!this.simulation.paused) {
            // Run ticks based on speed setting
            const baseTicks = 2; // Balanced for stability and speed
            const speedTicks = Math.max(1, Math.round(this.simulation.speed * baseTicks));
            for (let i = 0; i < speedTicks; i++) {
                this.simulation.tick();
            }
        }
        
        // Render
        this.renderer.render();
        
        // Continue loop
        requestAnimationFrame(this.animate);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});
