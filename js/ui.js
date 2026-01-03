/**
 * UI Controller for Earth Physics Sandbox
 * Manages material palette, tools, and controls
 */

import { MATERIAL, MATERIALS, CATEGORIES, getColor } from './materials.js';

export class UIController {
    constructor(simulation, renderer) {
        this.sim = simulation;
        this.renderer = renderer;
        
        // Current state
        this.selectedMaterial = MATERIAL.SAND;
        this.selectedTool = 'draw';
        this.brushSize = 10;
        this.currentCategory = 'solids';
        
        // Drawing state
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        
        // Line tool state
        this.lineStart = null;
        
        // Initialize UI
        this.initMaterialPalette();
        this.initToolButtons();
        this.initControls();
        this.initInputHandlers();
        
        // Start with sand selected
        this.selectMaterial(MATERIAL.SAND);
    }

    /**
     * Initialize material palette
     */
    initMaterialPalette() {
        const grid = document.getElementById('material-grid');
        const tabs = document.querySelectorAll('.tab-btn');
        
        // Tab switching
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.currentCategory = tab.dataset.category;
                this.renderMaterialGrid();
            });
        });
        
        // Initial render
        this.renderMaterialGrid();
    }

    /**
     * SVG Icons for materials
     */
    getIcon(matName) {
        const icons = {
            'Air': '<path d="M4 12h16M4 8h10M10 16h10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
            'Stone': '<path d="M4 6h16v12H4z M4 6l4-4h8l4 4" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Dirt': '<path d="M4 18l4-8 4 4 8-8v12H4z" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Sand': '<path d="M12 4L4 20h16z M12 8v4" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Clay': '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none"/><path d="M8 12h8" stroke="currentColor" stroke-width="2"/>',
            'Metal': '<rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2" fill="none"/><path d="M4 10h16 M10 4v16" stroke="currentColor" stroke-width="2"/>',
            'Ice': '<path d="M12 2v20 M2 12h20 M5 5l14 14 M5 19L19 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
            'Water': '<path d="M12 2s-8 9-8 13a8 8 0 0 0 16 0c0-4-8-13-8-13z" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Mud': '<path d="M12 2s-8 9-8 13a8 8 0 0 0 16 0c0-4-8-13-8-13z M8 14h2 M14 16h2" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Oil': '<path d="M12 2s-6 8-6 12a6 6 0 0 0 12 0c0-4-6-12-6-12z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 10v4" stroke="currentColor" stroke-width="2"/>',
            'Lava': '<path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M12 4v4 M8 8l2 2 M16 8l-2 2" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Steam': '<path d="M8 16c-2 0-4-2-4-5s3-5 5-3c.5-2 2.5-3 4.5-2 2-2 5.5-1 5.5 2.5 0 1 .5 2 .5 2.5 0 3-2.5 5-5.5 5H8z" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Smoke': '<path d="M4 18c0-4 4-5 4-8 0-3 2-5 5-5 5 0 6 5 4 8 3 .5 3 5 1 5H4z" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Gas': '<circle cx="8" cy="8" r="4" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="14" r="3" stroke="currentColor" stroke-width="2"/><circle cx="14" cy="6" r="1" fill="currentColor"/>',
            'Grass': '<path d="M4 20v-8c0-2 2-4 4-4s4 2 4 4v8 M12 20v-6c0-2 2-4 4-4s4 2 4 4v6" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Plant': '<path d="M12 20V4 M12 10c0-4 4-6 6-4s2 6-2 6h-4 M12 14c0-3-4-5-6-3s-2 5 2 5h4" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Wood': '<path d="M6 2h12v20H6z M6 8h12 M6 14h12" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Charcoal': '<path d="M4 6h16v12H4z M6 10h2 M14 14h2 M10 8h4" stroke="currentColor" stroke-width="2" fill="none"/>',
            'Fire': '<path d="M12 2c0 5-5 8-5 13 0 3 2 5 5 5s5-2 5-5c0-5-5-8-5-13z" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 12c-1 2-1 4 0 5 1-1 1-3 0-5z" fill="currentColor"/>',
            'Electricity': '<path d="M13 2L6 11h6l-3 11 10-10h-6l5-10z" stroke="currentColor" stroke-width="2" stroke-linejoin="round" fill="none"/>',
            'Explosion': '<path d="M12 2l2 6 6 2-6 2 2 6-6-2-6 2 2-6-6-2 6-2z" stroke="currentColor" stroke-width="2" fill="none"/>'
        };
        return icons[matName] || '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>';
    }

    /**
     * Render materials for current category
     */
    renderMaterialGrid() {
        const grid = document.getElementById('material-grid');
        grid.innerHTML = '';
        
        const materials = CATEGORIES[this.currentCategory] || [];
        
        materials.forEach(matId => {
            const mat = MATERIALS[matId];
            if (!mat) return;
            
            const btn = document.createElement('button');
            btn.className = `material-btn material-${mat.name.toLowerCase()}`;
            btn.dataset.material = matId;
            
            // Icon
            const icon = document.createElement('div');
            icon.className = 'material-icon';
            icon.innerHTML = `<svg viewBox="0 0 24 24" fill="none">${this.getIcon(mat.name)}</svg>`;
            btn.appendChild(icon);
            
            // Add name label
            const name = document.createElement('span');
            name.className = 'material-name';
            name.textContent = mat.name;
            btn.appendChild(name);
            
            // Active state
            if (matId === this.selectedMaterial) {
                btn.classList.add('active');
            }
            
            btn.addEventListener('click', () => {
                this.selectMaterial(matId);
            });
            
            grid.appendChild(btn);
        });
    }

    /**
     * Select a material
     */
    selectMaterial(matId) {
        this.selectedMaterial = matId;
        
        // Update UI
        document.querySelectorAll('.material-btn').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.material) === matId);
        });
    }

    /**
     * Initialize tool buttons
     */
    initToolButtons() {
        const toolBtns = document.querySelectorAll('.tool-btn');
        
        toolBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                toolBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.selectedTool = btn.dataset.tool;
            });
        });
    }

    /**
     * Initialize simulation controls
     */
    initControls() {
        // Brush size
        const brushSlider = document.getElementById('brush-size');
        const brushValue = document.getElementById('brush-size-value');
        
        brushSlider.addEventListener('input', () => {
            this.brushSize = parseInt(brushSlider.value);
            brushValue.textContent = this.brushSize;
        });
        
        // Speed control
        const speedSlider = document.getElementById('sim-speed');
        const speedValue = document.getElementById('speed-value');
        
        speedSlider.addEventListener('input', () => {
            const speed = parseFloat(speedSlider.value);
            this.sim.setSpeed(speed);
            speedValue.textContent = `${speed}x`;
        });
        
        // Play/Pause
        const btnPlay = document.getElementById('btn-play');
        const iconPlay = document.getElementById('icon-play');
        const iconPause = document.getElementById('icon-pause');
        
        btnPlay.addEventListener('click', () => {
            const paused = this.sim.togglePause();
            iconPlay.style.display = paused ? 'block' : 'none';
            iconPause.style.display = paused ? 'none' : 'block';
            btnPlay.classList.toggle('active', !paused);
        });
        
        // Step
        const btnStep = document.getElementById('btn-step');
        btnStep.addEventListener('click', () => {
            this.sim.step();
        });
        
        // Reset
        const btnReset = document.getElementById('btn-reset');
        btnReset.addEventListener('click', () => {
            if (confirm('Reset the simulation? This will clear everything.')) {
                this.sim.reset();
            }
        });
        
        // Overlays
        document.getElementById('overlay-heat').addEventListener('change', (e) => {
            this.renderer.showHeat = e.target.checked;
        });
        
        document.getElementById('overlay-pressure').addEventListener('change', (e) => {
            this.renderer.showPressure = e.target.checked;
        });
    }

    /**
     * Initialize input handlers for drawing
     */
    initInputHandlers() {
        const canvas = this.renderer.canvas;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.handlePointerDown(e));
        canvas.addEventListener('mousemove', (e) => this.handlePointerMove(e));
        canvas.addEventListener('mouseup', (e) => this.handlePointerUp(e));
        canvas.addEventListener('mouseleave', () => this.handlePointerUp());
        
        // Touch events
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePointerDown(e.touches[0]);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handlePointerMove(e.touches[0]);
        });
        canvas.addEventListener('touchend', (e) => {
            this.handlePointerUp();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.code) {
                case 'Space':
                    e.preventDefault();
                    document.getElementById('btn-play').click();
                    break;
                case 'KeyR':
                    if (!e.ctrlKey) {
                        document.getElementById('btn-reset').click();
                    }
                    break;
                case 'BracketLeft':
                    this.brushSize = Math.max(1, this.brushSize - 2);
                    document.getElementById('brush-size').value = this.brushSize;
                    document.getElementById('brush-size-value').textContent = this.brushSize;
                    break;
                case 'BracketRight':
                    this.brushSize = Math.min(50, this.brushSize + 2);
                    document.getElementById('brush-size').value = this.brushSize;
                    document.getElementById('brush-size-value').textContent = this.brushSize;
                    break;
            }
            
            // Number keys for quick material selection
            if (e.key >= '1' && e.key <= '9') {
                const materials = CATEGORIES[this.currentCategory];
                const idx = parseInt(e.key) - 1;
                if (materials && materials[idx] !== undefined) {
                    this.selectMaterial(materials[idx]);
                }
            }
        });
        
        // Scroll wheel for brush size
        canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.brushSize = Math.min(50, this.brushSize + 1);
            } else {
                this.brushSize = Math.max(1, this.brushSize - 1);
            }
            document.getElementById('brush-size').value = this.brushSize;
            document.getElementById('brush-size-value').textContent = this.brushSize;
        });
    }

    /**
     * Handle pointer down
     */
    handlePointerDown(e) {
        const pos = this.renderer.screenToGrid(e.clientX, e.clientY);
        this.isDrawing = true;
        this.lastX = pos.x;
        this.lastY = pos.y;
        
        if (this.selectedTool === 'line' || this.selectedTool === 'rect') {
            this.lineStart = { x: pos.x, y: pos.y };
        } else {
            this.draw(pos.x, pos.y);
        }
    }

    /**
     * Handle pointer move
     */
    handlePointerMove(e) {
        const pos = this.renderer.screenToGrid(e.clientX, e.clientY);
        
        // Show brush preview
        const color = getColor(this.selectedMaterial);
        this.renderer.drawBrushPreview(pos.x, pos.y, this.brushSize, color);
        
        if (!this.isDrawing) return;
        
        if (this.selectedTool === 'line' || this.selectedTool === 'rect') {
            // Preview line/rect
            return;
        }
        
        // Draw line from last position for smooth strokes
        this.sim.drawLine(this.lastX, this.lastY, pos.x, pos.y, 
            this.selectedTool === 'erase' ? MATERIAL.AIR : this.selectedMaterial, 
            this.brushSize);
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    /**
     * Handle pointer up
     */
    handlePointerUp(e) {
        if (!this.isDrawing) return;
        
        if (this.lineStart && e) {
            const pos = this.renderer.screenToGrid(e.clientX, e.clientY);
            
            if (this.selectedTool === 'line') {
                this.sim.drawLine(
                    this.lineStart.x, this.lineStart.y,
                    pos.x, pos.y,
                    this.selectedMaterial,
                    this.brushSize
                );
            } else if (this.selectedTool === 'rect') {
                this.drawRect(
                    this.lineStart.x, this.lineStart.y,
                    pos.x, pos.y
                );
            }
        }
        
        this.isDrawing = false;
        this.lineStart = null;
    }

    /**
     * Draw at position
     */
    draw(x, y) {
        const material = this.selectedTool === 'erase' ? MATERIAL.AIR : this.selectedMaterial;
        this.sim.drawBrush(x, y, material, this.brushSize);
    }

    /**
     * Draw rectangle
     */
    drawRect(x0, y0, x1, y1) {
        const minX = Math.min(x0, x1);
        const maxX = Math.max(x0, x1);
        const minY = Math.min(y0, y1);
        const maxY = Math.max(y0, y1);
        
        for (let y = minY; y <= maxY; y++) {
            for (let x = minX; x <= maxX; x++) {
                this.sim.setCell(x, y, this.selectedMaterial);
            }
        }
    }

    /**
     * Update stats display
     */
    updateStats(fps) {
        document.getElementById('stat-particles').textContent = 
            this.sim.particleCount.toLocaleString();
        document.getElementById('stat-fps').textContent = fps.toFixed(0);
    }
}
