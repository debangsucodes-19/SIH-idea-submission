# AI Sports Fitness & Performance Portal

An interactive browser-based sports fitness assessment app that uses the user's webcam and MediaPipe Pose Landmarker to analyze exercise movements in real time.

The current prototype is focused on **live exercise assessment**. A user selects a sport, enters their fitness/profile information, starts the webcam, performs the displayed exercises, and receives a form/completion score.

## What the App Actually Does

### 1. User Entry & Profile
The app provides an entrance/authentication-style flow where the user can:
- Sign in using the available Google/phone UI options.
- Enter basic profile information such as name, age, height, weight, fitness level, exercise days, and motivation.
- See a calculated BMI from height and weight.

> The current prototype stores user/profile and assessment information in the browser's local storage. It is not yet connected to a production authentication service or cloud database.

### 2. Sports Selection
The user can select a sport from the sports available in the current prototype:
- Cricket
- Football
- Running
- Kabaddi

The selected sport determines the assessment content shown to the user.

### 3. Personalized Assessment
After selecting a sport, the app prepares a live assessment containing sport-specific exercises.

Before starting, the user can see:
- The exercises included in the assessment
- Exercise descriptions
- Basic instructions for performing the movements

### 4. Live Webcam Exercise Analysis
The main feature of the prototype is real-time exercise analysis through the browser webcam.

When the user clicks **Start Camera & Begin**:
1. The browser requests webcam permission.
2. The live camera feed is displayed.
3. MediaPipe Pose Landmarker loads after the camera starts.
4. The app detects the user's body landmarks.
5. The detected pose is drawn over the live video.
6. Exercise-specific joint angles are checked against predefined ranges.

The app can provide immediate form feedback such as:
- **Good Form**
- **Fix Your Posture**
- Which body-angle check needs correction

### 5. Rep Counting
For supported exercises, the app uses joint-angle movement states to count repetitions.

The assessment tracks:
- Current repetitions
- Target repetitions
- Exercise progress
- Good-form frames
- Bad-form frames
- Total analyzed frames

When the target repetitions are completed, the app automatically moves to the next exercise.

### 6. Exercise Completion & Scoring
After the exercises are completed, the app generates an assessment result.

The current scoring logic combines:
- **60% form accuracy**
- **40% repetition completion**

The result screen shows:
- Overall score
- Exercise-wise repetitions
- Exercise-wise form accuracy
- Assessment breakdown

The user can save the assessment result and return to the dashboard.

### 7. Dashboard
The dashboard displays the user's stored profile and assessment information, including:
- Basic fitness/profile information
- Selected sports
- Fitness level
- Assessment results
- Previous score information

## Current Technical Implementation

### Frontend
- HTML
- CSS
- Vanilla JavaScript
- Responsive browser UI

### Computer Vision / AI
- MediaPipe Tasks Vision
- Pose Landmarker
- Real-time body landmark detection
- Joint-angle based posture evaluation
- Rule-based repetition counting

### Browser APIs
- getUserMedia() for webcam access
- Local Storage for prototype user and assessment data

### AI Loading & Camera Reliability
The webcam is started independently before MediaPipe is loaded. This prevents a MediaPipe/CDN/model-loading problem from stopping the camera itself.

The current implementation also includes:
- GPU delegate with CPU fallback
- Webcam constraint fallback
- Camera connection/error status
- Camera permission handling
- Explicit video playback initialization
- Continued camera display even if pose AI fails to load

## Current Scope

This repository is a **working prototype**, not yet a complete production sports platform.

Currently implemented:
- User/profile flow
- Sport selection
- Live webcam access
- Real-time pose detection
- Exercise form checks
- Repetition counting
- Exercise progression
- Assessment scoring
- Local result storage
- Dashboard/result display

Planned future capabilities can include:
- Secure real Google/mobile authentication
- Cloud database and user accounts
- More exercises and sports
- Personalized training plans
- More advanced fitness/performance recommendations
- Historical progress analytics
- Athlete-specific performance insights
- Mobile application support
- Backend APIs and production deployment

## How to Run

Because the app uses the browser webcam API, run it through **localhost or HTTPS** instead of opening the HTML file directly.

### Using Python

Open a terminal in the project folder:

    python -m http.server 5500

Then open:

    http://localhost:5500/index.html

Click **Start Camera & Begin** and allow camera access when Chrome/Edge asks for permission.

## Project Files

- index.html — main application UI, pages, profile flow, sports selection, dashboard and assessment interface
- exercise.js — webcam handling, MediaPipe Pose Landmarker integration, pose evaluation, repetition counting and scoring
- sports-portal.html — additional browser entry point
- README.md — project documentation

## Important Note

The current application performs pose analysis using predefined exercise rules and joint-angle thresholds. It is a prototype for demonstrating real-time sports/fitness assessment and should not be treated as a medical or professional athletic diagnosis system.
