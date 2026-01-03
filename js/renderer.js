/**
 * Renderer for Earth Physics Sandbox
 * Optimized for performance
 */

export class Renderer {
    constructor(canvas, overlayCanvas, simulation) {
        this.canvas = canvas;
        this.overlay = overlayCanvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.overlayCtx = overlayCanvas.getContext('2d');
        this.sim = simulation;
        
        // Set canvas sizes
        this.canvas.width = simulation.width;
        this.canvas.height = simulation.height;
        this.overlay.width = simulation.width;
        this.overlay.height = simulation.height;
        
        // Create image data buffer
        this.imageData = this.ctx.createImageData(simulation.width, simulation.height);
        
        // Display scaling
        this.scale = 2;
        this.updateCanvasSize();
        
        // Glow effect disabled by default for performance
        this.glowEnabled = false;
        
        // Overlay settings
        this.showHeat = false;
        this.showPressure = false;
    }

    /**
     * Update canvas display size based on scale
     */
    updateCanvasSize() {
        const displayWidth = this.sim.width * this.scale;
        const displayHeight = this.sim.height * this.scale;
        
        this.canvas.style.width = `${displayWidth}px`;
        this.canvas.style.height = `${displayHeight}px`;
        this.overlay.style.width = `${displayWidth}px`;
        this.overlay.style.height = `${displayHeight}px`;
        
        // Position overlay
        this.overlay.style.position = 'absolute';
        this.overlay.style.left = this.canvas.offsetLeft + 'px';
        this.overlay.style.top = this.canvas.offsetTop + 'px';
    }

    /**
     * Set display scale
     */
    setScale(scale) {
        this.scale = scale;
        this.updateCanvasSize();
    }

    /**
     * Render the simulation - optimized
     */
    render() {
        // Get color buffer from simulation and copy directly
        this.imageData.data.set(this.sim.getColorBuffer());
        
        // Draw to canvas
        this.ctx.putImageData(this.imageData, 0, 0);
        
        // Render overlays only if enabled
        if (this.showHeat || this.showPressure) {
            this.renderOverlay();
        }
    }

    /**
     * Render temperature or pressure overlay
     */
    renderOverlay() {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        if (this.showHeat) {
            for (let y = 0; y < this.sim.height; y += 6) {
                for (let x = 0; x < this.sim.width; x += 6) {
                    const cell = this.sim.getCell(x, y);
                    const temp = cell.temperature || 20;
                    
                    let r = 0, g = 0, b = 0, a = 0;
                    if (temp > 100) {
                        r = Math.min(255, (temp - 100) / 4);
                        g = Math.max(0, 100 - (temp - 100) / 10);
                        a = Math.min(0.5, (temp - 100) / 500);
                    } else if (temp < 0) {
                        b = Math.min(255, -temp * 3);
                        a = Math.min(0.5, -temp / 100);
                    }
                    
                    if (a > 0.05) {
                        this.overlayCtx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;
                        this.overlayCtx.fillRect(x, y, 6, 6);
                    }
                }
            }
        }
    }

    /**
     * Draw brush preview
     */
    drawBrushPreview(x, y, radius, color) {
        this.overlayCtx.clearRect(0, 0, this.overlay.width, this.overlay.height);
        
        this.overlayCtx.beginPath();
        this.overlayCtx.arc(x, y, radius, 0, Math.PI * 2);
        this.overlayCtx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        this.overlayCtx.lineWidth = 1.5;
        this.overlayCtx.stroke();
        
        if (color) {
            this.overlayCtx.fillStyle = `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.25)`;
            this.overlayCtx.fill();
        }
    }

    /**
     * Convert screen coordinates to grid coordinates
     */
    screenToGrid(screenX, screenY) {
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor((screenX - rect.left) / this.scale);
        const y = Math.floor((screenY - rect.top) / this.scale);
        return { x, y };
    }
}
