# 📸 Background Remover (BG Removal Nano)

**The easiest way to remove backgrounds from photos!** No account needed, no uploads - everything works in your browser.

## 🌟 What Does This Do?

Takes any photo and removes the background, replacing it with a clean white background. Perfect for:
- Product photos
- Profile pictures
- eBay/Etsy listings
- Resume photos
- Any image where you want a clean white background

## ⚡ Quick Start (For Beginners)

### **Step 1: Open the App**

1. Download this folder to your computer
2. Open a terminal/command prompt
3. Navigate to this folder
4. Run this command:
   ```bash
   python3 -m http.server 8000
   ```
5. Open your web browser and go to: `http://localhost:8000`

**Don't have Python?** Just double-click `index.html` (though camera won't work)

### **Step 2: Remove Background from Your Photo**

1. **Choose "Upload from Computer"** (easiest option!)
2. Select your photo
3. Wait 5-10 seconds while AI processes it
4. Done! Photo automatically downloads to your Downloads folder

**Want to use camera instead?**
- Click "Use Camera"
- Your browser will ask permission - click "Allow"
- Take photo when ready

### **Step 3: Make It Even Better (Optional)**

After processing, you can:
- Click **Brighter** or **Darker** to adjust lighting
- Click **Add Shadow** for a professional drop shadow
- Click **Add Border** to frame your image
- Type custom instructions like "crop to square" or "add sepia"

## 🎯 Simple Instructions

### If Camera Doesn't Work
**Don't worry!** Just use "Upload from Computer" instead. It works the same way.

### Where Did My Photo Go?
Check your browser's **Downloads** folder. The file is named `bg-removed-[numbers].png`

### Photo Too Big?
For fastest results, use photos under 2MB. Large photos (10MB+) might be slow or fail.

### Best Results Tips
- Use good lighting
- Keep subject centered
- Use a photo with your subject clearly separated from background

## 🔧 Technical Details (For Advanced Users)

### Features
- ✅ **Two Input Methods**: File upload or camera
- ✅ **AI Background Removal**: Uses @imgly/background-removal
- ✅ **White Background**: Clean professional look
- ✅ **Auto-Download**: Saves immediately after processing
- ✅ **Quick Edits**: Brightness, shadow, border with one click
- ✅ **Text Instructions**: Natural language image editing
- ✅ **Privacy First**: All processing in browser, no uploads
- ✅ **Mobile Friendly**: Works on phones and tablets

### Browser Requirements
- Chrome 90+ (recommended)
- Firefox 88+
- Edge 90+
- Safari 14.1+
- Must use `localhost` or HTTPS for camera access

### Running the App

**Method 1: Python (Recommended)**
```bash
python3 -m http.server 8000
```
Then open: `http://localhost:8000`

**Method 2: Node.js**
```bash
npm install -g http-server
http-server -p 8000
```
Then open: `http://localhost:8000`

**Method 3: Direct File (Camera Won't Work)**
Just double-click `index.html` - but file upload will still work!

### Supported Text Instructions

You can type natural instructions like:
- `brighter` or `lighter` - Increase brightness
- `darker` or `dim` - Decrease brightness
- `contrast` - Enhance contrast
- `blur` - Add blur effect
- `sharpen` - Sharpen image
- `grayscale` or `black and white` - Remove color
- `sepia` - Vintage sepia tone
- `shadow` - Add drop shadow
- `border` - Add black border
- `crop to square` - Make it square

You can combine them: `brighter and add shadow`

## 🆘 Troubleshooting

### "Camera not working"
- Make sure you clicked "Allow" when browser asks for permission
- Try using **Upload from Computer** instead (easier!)
- Make sure you're using `localhost` or HTTPS

### "Processing failed"
- Try a smaller photo (under 5MB)
- Make sure it's a valid image file (JPG, PNG, WEBP)
- Refresh the page and try again

### "Can't find downloaded photo"
- Check your browser's Downloads folder
- Look for files named `bg-removed-[timestamp].png`
- Your browser might ask where to save - check for a popup

### "Too slow"
- Use smaller photos (under 2MB is fastest)
- Close other browser tabs
- Try a different browser (Chrome usually fastest)

## 🔒 Privacy

**Your photos never leave your computer!** All AI processing happens locally in your browser. No server uploads, no cloud processing, no storage.

## 📝 License

MIT License - Free to use, modify, and share!

## 💡 Tips & Tricks

1. **Use file upload** - It's easier and more reliable than camera
2. **Take photos in good lighting** - Better input = better output
3. **Keep file size under 2MB** - Faster processing
4. **Use the quick edit buttons** - Easy way to adjust result
5. **Process multiple photos** - Just click "Process Another Photo"

## 🐛 Having Issues?

If something doesn't work:
1. Refresh the page
2. Try a different browser (Chrome recommended)
3. Check that your photo is under 10MB
4. Make sure you're using a supported image format
5. Try file upload instead of camera

---

**Made with ❤️ using AI background removal technology**

Need help? Just reload the page and try again - it's that simple!
