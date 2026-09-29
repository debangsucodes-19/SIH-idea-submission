# Sports Portal

Because this app uses the browser webcam API, run it through localhost instead of double-clicking the HTML file.

Open a terminal in this folder:

```bash
python -m http.server 5500
```

Then open:

```text
http://localhost:5500/index.html
```

Click **Start Camera & Begin** and choose **Allow** when Chrome/Edge asks for camera access.

## What was fixed

The previous implementation loaded MediaPipe before starting the webcam. If the MediaPipe CDN import failed, the whole module could stop before the camera handler was attached.

The new implementation:

1. Starts the webcam first.
2. Displays the camera independently.
3. Loads MediaPipe only after the camera is running.
4. Uses GPU first and CPU fallback for MediaPipe.
5. Handles webcams that reject `facingMode`.
6. Shows a visible `Camera: connected` diagnostic.
7. Keeps the camera running if the AI model itself fails to load.

## Files

- `index.html` — main browser application
- `exercise.js` — separate camera + MediaPipe exercise module
- `sports-portal.html` — duplicate browser entry point
