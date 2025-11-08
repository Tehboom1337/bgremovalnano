import { removeBackground } from 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.4.5/+esm';

class SimpleBackgroundRemover {
    constructor() {
        this.originalImageBlob = null;
        this.processedImageBlob = null;
        this.stream = null;
        this.currentFacingMode = 'environment';

        this.initializeElements();
        this.attachEventListeners();
        this.setActiveStep(1);
    }

    initializeElements() {
        // Sections
        this.methodSelection = document.getElementById('methodSelection');
        this.uploadSection = document.getElementById('uploadSection');
        this.cameraSection = document.getElementById('cameraSection');
        this.loadingSection = document.getElementById('loadingSection');
        this.resultSection = document.getElementById('resultSection');
        this.errorSection = document.getElementById('errorSection');

        // Buttons
        this.useFileBtn = document.getElementById('useFileBtn');
        this.useCameraBtn = document.getElementById('useCameraBtn');
        this.backToMethodBtn = document.getElementById('backToMethodBtn');
        this.backToMethodBtn2 = document.getElementById('backToMethodBtn2');
        this.captureBtn = document.getElementById('captureBtn');
        this.switchCamera = document.getElementById('switchCamera');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.startOverBtn = document.getElementById('startOverBtn');
        this.retryBtn = document.getElementById('retryBtn');
        this.applyInstructionBtn = document.getElementById('applyInstructionBtn');

        // Input elements
        this.fileInput = document.getElementById('fileInput');
        this.uploadArea = document.getElementById('uploadArea');
        this.instructionInput = document.getElementById('instructionInput');

        // Media elements
        this.video = document.getElementById('video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');

        // Result elements
        this.beforeImage = document.getElementById('beforeImage');
        this.afterImage = document.getElementById('afterImage');
        this.errorMessage = document.getElementById('errorMessage');

        // Quick edit buttons
        this.quickEditBtns = document.querySelectorAll('.quick-edit-btn');
    }

    attachEventListeners() {
        // Method selection
        this.useFileBtn.addEventListener('click', () => this.showUploadSection());
        this.useCameraBtn.addEventListener('click', () => this.showCameraSection());
        this.backToMethodBtn.addEventListener('click', () => this.backToMethodSelection());
        this.backToMethodBtn2.addEventListener('click', () => this.backToMethodSelection());

        // File upload
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Drag and drop
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Camera
        this.captureBtn.addEventListener('click', () => this.capturePhoto());
        this.switchCamera.addEventListener('click', () => this.switchCameraFacing());

        // Result actions
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        this.startOverBtn.addEventListener('click', () => this.startOver());
        this.retryBtn.addEventListener('click', () => this.startOver());

        // Quick edits
        this.quickEditBtns.forEach(btn => {
            btn.addEventListener('click', () => this.applyQuickEdit(btn.dataset.action));
        });

        // Custom instructions
        this.applyInstructionBtn.addEventListener('click', () => this.applyCustomInstructions());
    }

    setActiveStep(stepNumber) {
        for (let i = 1; i <= 4; i++) {
            const step = document.getElementById(`step${i}`);
            if (i === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        }
    }

    showSection(section) {
        [this.methodSelection, this.uploadSection, this.cameraSection,
         this.loadingSection, this.resultSection, this.errorSection].forEach(s => {
            s.style.display = 'none';
        });
        section.style.display = 'block';
    }

    showUploadSection() {
        this.setActiveStep(2);
        this.showSection(this.uploadSection);
    }

    async showCameraSection() {
        try {
            this.setActiveStep(2);
            this.showSection(this.cameraSection);
            await this.initializeCamera();
        } catch (error) {
            this.showError('Could not access camera. Please try uploading a file instead.');
        }
    }

    backToMethodSelection() {
        this.setActiveStep(1);
        this.showSection(this.methodSelection);
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
    }

    async initializeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }

        try {
            // Try with facingMode
            const constraints = {
                video: { facingMode: { ideal: this.currentFacingMode } },
                audio: false
            };
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
        } catch (error) {
            // Fallback to simple video
            try {
                const simpleConstraints = { video: true, audio: false };
                this.stream = await navigator.mediaDevices.getUserMedia(simpleConstraints);
                this.video.srcObject = this.stream;
            } catch (err) {
                throw new Error('Camera access denied or unavailable');
            }
        }
    }

    async switchCameraFacing() {
        this.currentFacingMode = this.currentFacingMode === 'environment' ? 'user' : 'environment';
        try {
            await this.initializeCamera();
        } catch (error) {
            this.showError('Could not switch camera');
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.type.startsWith('image/')) {
            this.showError('Please select an image file (JPG, PNG, or WEBP)');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            fetch(e.target.result)
                .then(res => res.blob())
                .then(blob => {
                    this.originalImageBlob = blob;
                    this.processImage(blob);
                });
        };
        reader.readAsDataURL(file);
    }

    capturePhoto() {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
        this.ctx.drawImage(this.video, 0, 0);

        this.canvas.toBlob((blob) => {
            this.originalImageBlob = blob;
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
            }
            this.processImage(blob);
        }, 'image/png');
    }

    async processImage(imageBlob) {
        this.setActiveStep(3);
        this.showSection(this.loadingSection);

        try {
            // Convert blob to data URL
            const dataURL = await this.blobToDataURL(imageBlob);

            // Remove background
            const resultBlob = await removeBackground(dataURL);

            // Add white background
            await this.addWhiteBackground(resultBlob);

        } catch (error) {
            console.error('Processing error:', error);
            this.showError('Failed to process image. ' + error.message);
        }
    }

    blobToDataURL(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async addWhiteBackground(foregroundBlob) {
        const img = new Image();
        const url = URL.createObjectURL(foregroundBlob);

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            // White background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw foreground
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((finalBlob) => {
                this.processedImageBlob = finalBlob;
                this.displayResult();
                URL.revokeObjectURL(url);
            }, 'image/png');
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            this.showError('Failed to create final image');
        };

        img.src = url;
    }

    async displayResult() {
        this.setActiveStep(4);
        this.showSection(this.resultSection);

        // Show before and after
        this.beforeImage.src = URL.createObjectURL(this.originalImageBlob);
        this.afterImage.src = URL.createObjectURL(this.processedImageBlob);

        // Auto-download
        this.autoDownloadImage();
    }

    autoDownloadImage() {
        const url = URL.createObjectURL(this.processedImageBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bg-removed-${Date.now()}.png`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();

        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    }

    downloadImage() {
        this.autoDownloadImage();
    }

    async applyQuickEdit(action) {
        if (!this.processedImageBlob) return;

        this.setActiveStep(3);
        this.showSection(this.loadingSection);

        try {
            const img = await this.loadImage(this.processedImageBlob);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0);

            // Apply the edit
            switch(action) {
                case 'brighter':
                    this.adjustBrightness(ctx, 1.3);
                    break;
                case 'darker':
                    this.adjustBrightness(ctx, 0.7);
                    break;
                case 'shadow':
                    await this.addShadowEffect(ctx, img);
                    break;
                case 'border':
                    this.addBorder(ctx);
                    break;
            }

            canvas.toBlob((blob) => {
                this.processedImageBlob = blob;
                this.displayResult();
            }, 'image/png');

        } catch (error) {
            this.showError('Failed to apply edit');
        }
    }

    async applyCustomInstructions() {
        const instructions = this.instructionInput.value.trim().toLowerCase();
        if (!instructions || !this.processedImageBlob) return;

        this.setActiveStep(3);
        this.showSection(this.loadingSection);

        try {
            const img = await this.loadImage(this.processedImageBlob);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');

            ctx.drawImage(img, 0, 0);

            // Parse and apply instructions
            if (instructions.includes('bright')) this.adjustBrightness(ctx, 1.3);
            if (instructions.includes('dark') || instructions.includes('dim')) this.adjustBrightness(ctx, 0.7);
            if (instructions.includes('contrast')) this.adjustContrast(ctx);
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
            if (instructions.includes('shadow')) await this.addShadowEffect(ctx, img);
            if (instructions.includes('border')) this.addBorder(ctx);
            if (instructions.includes('crop') && instructions.includes('square')) this.cropToSquare(ctx, img);

            canvas.toBlob((blob) => {
                this.processedImageBlob = blob;
                this.instructionInput.value = '';
                this.displayResult();
            }, 'image/png');

        } catch (error) {
            this.showError('Failed to apply instructions');
        }
    }

    loadImage(blob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.onload = () => {
                URL.revokeObjectURL(url);
                resolve(img);
            };
            img.onerror = () => {
                URL.revokeObjectURL(url);
                reject(new Error('Failed to load image'));
            };
            img.src = url;
        });
    }

    adjustBrightness(ctx, factor) {
        const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] * factor);
            data[i + 1] = Math.min(255, data[i + 1] * factor);
            data[i + 2] = Math.min(255, data[i + 2] * factor);
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

    async addShadowEffect(ctx, img) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;

        ctx.drawImage(img, 0, 0);

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

    showError(message) {
        this.setActiveStep(1);
        this.showSection(this.errorSection);
        this.errorMessage.textContent = message;
    }

    startOver() {
        this.originalImageBlob = null;
        this.processedImageBlob = null;
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
        }
        this.setActiveStep(1);
        this.showSection(this.methodSelection);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SimpleBackgroundRemover();
});
