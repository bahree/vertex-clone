// Unified input handler for both mouse and touch events
class InputHandler {
    constructor(canvas, callbacks) {
        this.canvas = canvas;
        this.callbacks = callbacks;
        this.isDrawing = false;
        this.startVertex = null;

        this.setupEventListeners();
    }

    setupEventListeners() {
        // Mouse events
        this.canvas.addEventListener('mousedown', (e) => this.handleStart(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleEnd(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleEnd(e));

        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handleStart(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.handleMove(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleEnd(e);
        }, { passive: false });
    }

    // Get pointer position from mouse or touch event
    getPointerPosition(event) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = event.touches?.[0] || event.changedTouches?.[0] || event;
        
        const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
        const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
        
        return { x, y };
    }

    handleStart(event) {
        const pos = this.getPointerPosition(event);
        
        if (this.callbacks.onStart) {
            const result = this.callbacks.onStart(pos.x, pos.y);
            if (result) {
                this.isDrawing = true;
                this.startVertex = result;
            }
        }
    }

    handleMove(event) {
        if (!this.isDrawing) return;

        const pos = this.getPointerPosition(event);
        
        if (this.callbacks.onMove) {
            this.callbacks.onMove(pos.x, pos.y, this.startVertex);
        }
    }

    handleEnd(event) {
        if (!this.isDrawing) return;

        const pos = this.getPointerPosition(event);
        
        if (this.callbacks.onEnd) {
            this.callbacks.onEnd(pos.x, pos.y, this.startVertex);
        }

        this.isDrawing = false;
        this.startVertex = null;
    }

    destroy() {
        // Clean up event listeners if needed
        this.callbacks = null;
    }
}
