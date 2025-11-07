import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm';

class BackgroundRemovalApp {
    constructor() {
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.stream = null;
        this.currentFacingMode = 'environment';
        this.processedImageBlob = null;

        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.startCameraBtn = document.getElementById('startCamera');
        this.captureBtn = document.getElementById('captureBtn');
        this.switchCameraBtn = document.getElementById('switchCamera');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.retakeBtn = document.getElementById('retakeBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.applyInstructionBtn = document.getElementById('applyInstructionBtn');
        this.instructionInput = document.getElementById('instructionInput');

        this.loadingState = document.getElementById('loadingState');
        this.resultContainer = document.getElementById('resultContainer');
        this.errorState = document.getElementById('errorState');
        this.resultImage = document.getElementById('resultImage');
        this.errorMessage = document.querySelector('.error-message');
    }

    attachEventListeners() {
        this.startCameraBtn.addEventListener('click', () => this.startCamera());
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.switchCameraBtn.addEventListener('click', () => this.switchCamera());
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.retakeBtn.addEventListener('click', () => this.retake());
        this.retryBtn.addEventListener('click', () => this.hideError());
        this.applyInstructionBtn.addEventListener('click', () => this.applyInstructions());
        this.instructionInput.addEventListener('input', () => {
            this.applyInstructionBtn.disabled = !this.instructionInput.value.trim();
        });
    }

    async startCamera() {
        try {
            await this.initializeCamera(this.currentFacingMode);
            this.startCameraBtn.textContent = '✓ Camera Active';
            this.startCameraBtn.disabled = true;
            this.captureBtn.disabled = false;
            this.switchCameraBtn.disabled = false;
        } catch (error) {
            this.showError('Camera access denied or not available: ' + error.message);
        }
    }

    async initializeCamera(facingMode) {
        // Stop existing stream if any
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        // Try with facingMode first
        try {
            const constraints = {
                video: {
                    facingMode: { ideal: facingMode }
                },
                audio: false
            };
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            return;
        } catch (error) {
            console.log('Failed with facingMode, trying simple constraints:', error);
        }

        // Fallback: Try with just video: true
        try {
            const simpleConstraints = { video: true, audio: false };
            this.stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
            this.video.srcObject = this.stream;
            return;
        } catch (error) {
            console.error('All camera initialization attempts failed:', error);
            throw new Error('Unable to access camera. Please check permissions and ensure you are using HTTPS or localhost.');
        }
    }

    async switchCamera() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        try {
            await this.initializeCamera(this.currentFacingMode);
        } catch (error) {
            this.showError('Could not switch camera: ' + error.message);
            // Switch back to previous mode
            this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        }
    }

    capturePhoto() {
        // Set canvas dimensions to match video
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;

        // Draw video frame to canvas
        this.ctx.drawImage(this.video, 0, 0);

        // Convert canvas to blob and process
        this.canvas.toBlob((blob) => {
            this.processImage(blob);
        }, 'image/png');
    }

    async processImage(imageBlob) {
        this.showLoading();

        try {
            // Convert blob to image for processing
            const imageBitmap = await createImageBitmap(imageBlob);

            // Create a temporary canvas for the input image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = imageBitmap.width;
            tempCanvas.height = imageBitmap.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(imageBitmap, 0, 0);

            // Remove background using the library
            const blob = await removeBackground(tempCanvas.toDataURL());

            // Add white background
            await this.addWhiteBackground(blob);

        } catch (error) {
            console.error('Error processing image:', error);
            this.showError('Failed to process image: ' + error.message);
        }
    }

    async addWhiteBackground(foregroundBlob) {
        // Create image from blob
        const img = new Image();
        const url = URL.createObjectURL(foregroundBlob);

        img.onload = () => {
            // Create canvas for final composition
            const compositeCanvas = document.createElement('canvas');
            compositeCanvas.width = img.width;
            compositeCanvas.height = img.height;
            const compositeCtx = compositeCanvas.getContext('2d');

            // Fill with white background
            compositeCtx.fillStyle = '#FFFFFF';
            compositeCtx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

            // Draw foreground image
            compositeCtx.drawImage(img, 0, 0);

            // Convert to blob and display
            compositeCanvas.toBlob((finalBlob) => {
                this.processedImageBlob = finalBlob;
                this.displayResult(finalBlob);
                URL.revokeObjectURL(url);
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            this.showError('Failed to create final image');
        };

        img.src = url;
    }

    displayResult(blob) {
        const url = URL.createObjectURL(blob);
        this.resultImage.src = url;

        this.loadingState.style.display = 'none';
        this.resultContainer.style.display = 'block';

        // Auto-save to Downloads folder
        this.autoSaveImage(blob);

        // Clean up old URLs
        this.resultImage.onload = () => {
            URL.revokeObjectURL(url);
        };
    }

    autoSaveImage(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product-shot-${Date.now()}.png`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        // Clean up after a short delay
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);

        console.log('Image auto-saved to Downloads folder');
    }

    downloadImage() {
        if (!this.processedImageBlob) return;

        const url = URL.createObjectURL(this.processedImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `product-shot-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    retake() {
        this.resultContainer.style.display = 'none';
        this.processedImageBlob = null;
    }

    showLoading() {
        this.loadingState.style.display = 'block';
        this.resultContainer.style.display = 'none';
        this.errorState.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorState.style.display = 'block';
        this.loadingState.style.display = 'none';
        this.resultContainer.style.display = 'none';
    }

    hideError() {
        this.errorState.style.display = 'none';
    }

    async applyInstructions() {
        const instructions = this.instructionInput.value.trim().toLowerCase();

        if (!this.processedImageBlob || !instructions) {
            return;
        }

        this.showLoading();

        try {
            // Create image from current processed blob
            const img = new Image();
            const url = URL.createObjectURL(this.processedImageBlob);

            img.onload = async () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');

                // Apply modifications based on instructions
                await this.processInstructions(ctx, img, instructions);

                // Convert to blob and display
                canvas.toBlob((modifiedBlob) => {
                    this.processedImageBlob = modifiedBlob;
                    this.displayResult(modifiedBlob);
                    URL.revokeObjectURL(url);
                    this.instructionInput.value = '';
                    this.applyInstructionBtn.disabled = true;
                }, 'image/png');
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                this.showError('Failed to apply instructions');
            };

            img.src = url;

        } catch (error) {
            console.error('Error applying instructions:', error);
            this.showError('Failed to apply instructions: ' + error.message);
        }
    }

    async processInstructions(ctx, img, instructions) {
        // Draw base image
        ctx.drawImage(img, 0, 0);

        // Parse and apply various instruction types
        if (instructions.includes('bright') || instructions.includes('lighter')) {
            this.adjustBrightness(ctx, 1.2);
        }

        if (instructions.includes('dark') || instructions.includes('dim')) {
            this.adjustBrightness(ctx, 0.8);
        }

        if (instructions.includes('contrast')) {
            this.adjustContrast(ctx);
        }

        if (instructions.includes('blur')) {
            ctx.filter = 'blur(2px)';
            ctx.drawImage(ctx.canvas, 0, 0);
            ctx.filter = 'none';
        }

        if (instructions.includes('sharpen')) {
            ctx.filter = 'contrast(1.2) saturate(1.1)';
            ctx.drawImage(ctx.canvas, 0, 0);
            ctx.filter = 'none';
        }

        if (instructions.includes('grayscale') || instructions.includes('black and white')) {
            ctx.filter = 'grayscale(100%)';
            ctx.drawImage(ctx.canvas, 0, 0);
            ctx.filter = 'none';
        }

        if (instructions.includes('sepia')) {
            ctx.filter = 'sepia(100%)';
            ctx.drawImage(ctx.canvas, 0, 0);
            ctx.filter = 'none';
        }

        if (instructions.includes('shadow')) {
            this.addShadow(ctx, img);
        }

        if (instructions.includes('border')) {
            this.addBorder(ctx);
        }

        // Size adjustments
        if (instructions.includes('crop') && instructions.includes('square')) {
            this.cropToSquare(ctx, img);
        }
    }

    adjustBrightness(ctx, factor) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);     // R
            data[i + 1] = Math.min(255, data[i + 1] * factor); // G
            data[i + 2] = Math.min(255, data[i + 2] * factor); // B
        }

        ctx.putImageData(imageData, 0, 0);
    }

    adjustContrast(ctx) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;
        const factor = 1.3;
        const intercept = 128 * (1 - factor);

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept));
            data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept));
            data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept));
        }

        ctx.putImageData(imageData, 0, 0);
    }

    addShadow(ctx, img) {
        // Create shadow effect
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        // Draw shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        // Draw image with shadow
        ctx.drawImage(img, 0, 0);

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    addBorder(ctx) {
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 10;
        ctx.strokeRect(5, 5, ctx.canvas.width - 10, ctx.canvas.height - 10);
    }

    cropToSquare(ctx, img) {
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;

        ctx.canvas.width = size;
        ctx.canvas.height = size;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, x, y, size, size, 0, 0, size, size);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundRemovalApp();
});
