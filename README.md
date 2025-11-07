# 📸 BG Removal Nano

A lightweight web application for creating professional product shots with automatic background removal and white background replacement using your device camera.

## Features

- **Camera Access**: Use your device's front or back camera
- **AI Background Removal**: Automatic subject detection and background removal
- **White Background**: Clean white background for professional product shots
- **Download Results**: Save processed images directly to your device
- **Responsive Design**: Works on desktop and mobile devices
- **Client-Side Processing**: All processing happens in your browser - no server needed

## How to Use

1. **Start the App**: Open `index.html` in a web browser
2. **Enable Camera**: Click "Start Camera" and allow camera access
3. **Position Product**: Frame your product in the camera view
4. **Capture**: Click "Capture Photo" when ready
5. **Wait**: The AI will process and remove the background (takes a few seconds)
6. **Download**: Save your professional product shot

## Running Locally

### Simple Method (Using Python)
```bash
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser

### Using npm
```bash
npm start
```

### Requirements
- Modern web browser with camera support
- HTTPS or localhost (required for camera access)

## Technical Stack

- **Vanilla JavaScript**: No framework dependencies
- **@imgly/background-removal**: AI-powered background removal
- **getUserMedia API**: Camera access
- **Canvas API**: Image processing and composition

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14.1+
- Mobile browsers with camera support

## Tips for Best Results

- Ensure good lighting on your product
- Use a contrasting background to your subject
- Keep the product centered in frame
- Hold the camera steady while capturing
- Allow a few seconds for processing

## Privacy

All image processing happens locally in your browser. No images are uploaded to any server.

## License

MIT