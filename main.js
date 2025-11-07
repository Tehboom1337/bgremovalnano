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

        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };

        try {
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            await this.video.play();
        } catch (error) {
            // If environment camera fails, try user camera
            if (facingMode === 'environment') {
                const fallbackConstraints = {
                    video: { facingMode: 'user' },
                    audio: false
                };
                this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
                this.video.srcObject = this.stream;
                await this.video.play();
                this.currentFacingMode = 'user';
            } else {
                throw error;
            }
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

        // Clean up old URLs
        this.resultImage.onload = () => {
            URL.revokeObjectURL(url);
        };
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BackgroundRemovalApp();
});
