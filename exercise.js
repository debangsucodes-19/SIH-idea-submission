// ============================================================
// Sports Portal – Live Assessment with MediaPipe Pose Detection
// ============================================================

let PoseLandmarker, FilesetResolver, DrawingUtils;

// ---------- Landmark indices ----------
const LM = {
  NOSE: 0,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,    RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,    RIGHT_WRIST: 16,
  LEFT_HIP: 23,      RIGHT_HIP: 24,
  LEFT_KNEE: 25,     RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,    RIGHT_ANKLE: 28
};

// ---------- Angle utility ----------
function calcAngle(a, b, c) {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let deg = Math.abs(rad * 180 / Math.PI);
  if (deg > 180) deg = 360 - deg;
  return deg;
}

function midpoint(a, b) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

// ---------- Exercise definitions per sport ----------
const EXERCISES = {
  Cricket: [
    {
      name: 'Squats',
      desc: 'Stand with feet shoulder-width apart. Lower your body by bending your knees to about 90°, then rise back up.',
      targetReps: 10,
      tips: ['Keep your back straight', 'Knees should not go past toes', 'Go as low as comfortable', 'Arms can extend forward for balance'],
      checks: [
        { label: 'Left Knee', joints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE], goodMin: 70, goodMax: 170 },
        { label: 'Right Knee', joints: [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE], goodMin: 70, goodMax: 170 },
        { label: 'Back Straight', joints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], goodMin: 140, goodMax: 200 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
        upMin: 155, upMax: 180,   // standing
        downMin: 60, downMax: 120 // squatted
      }
    },
    {
      name: 'Arm Raises',
      desc: 'Stand straight. Raise both arms from your sides up above your head, then lower them back down.',
      targetReps: 10,
      tips: ['Keep arms straight', 'Raise to full overhead', 'Control the movement', 'Keep torso still'],
      checks: [
        { label: 'Left Arm', joints: [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_WRIST], goodMin: 20, goodMax: 180 },
        { label: 'Right Arm', joints: [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_WRIST], goodMin: 20, goodMax: 180 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_WRIST],
        upMin: 150, upMax: 200,  // arms up
        downMin: 10, downMax: 60 // arms down
      }
    }
  ],
  Football: [
    {
      name: 'Lunges',
      desc: 'Step forward with one leg, lowering your hips until both knees are bent at about 90°. Alternate legs.',
      targetReps: 10,
      tips: ['Front knee at 90°', 'Back knee near the ground', 'Keep torso upright', 'Alternate legs each rep'],
      checks: [
        { label: 'Front Knee', joints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE], goodMin: 60, goodMax: 170 },
        { label: 'Torso Upright', joints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], goodMin: 130, goodMax: 200 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
        upMin: 155, upMax: 180,
        downMin: 60, downMax: 120
      }
    },
    {
      name: 'High Knees',
      desc: 'Stand tall. Lift each knee alternately as high as possible, aiming above hip level.',
      targetReps: 15,
      tips: ['Lift knee above hip height', 'Pump arms opposite to legs', 'Stay on the balls of your feet', 'Keep a steady pace'],
      checks: [
        { label: 'Left Knee Lift', joints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], goodMin: 40, goodMax: 170 },
        { label: 'Right Knee Lift', joints: [LM.RIGHT_SHOULDER, LM.RIGHT_HIP, LM.RIGHT_KNEE], goodMin: 40, goodMax: 170 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE],
        upMin: 150, upMax: 200,  // standing straight
        downMin: 40, downMax: 100 // knee raised high
      }
    }
  ],
  Running: [
    {
      name: 'High Knees',
      desc: 'Jog in place, lifting your knees as high as possible with each step.',
      targetReps: 15,
      tips: ['Lift knees above hip level', 'Land softly', 'Swing arms naturally', 'Maintain upright posture'],
      checks: [
        { label: 'Knee Lift', joints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], goodMin: 40, goodMax: 170 },
        { label: 'Posture', joints: [LM.NOSE, LM.LEFT_SHOULDER, LM.LEFT_HIP], goodMin: 140, goodMax: 200 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE],
        upMin: 150, upMax: 200,
        downMin: 40, downMax: 100
      }
    },
    {
      name: 'Jumping Jacks',
      desc: 'Start standing with arms at sides. Jump feet apart while raising arms overhead, then return.',
      targetReps: 12,
      tips: ['Full arm extension overhead', 'Feet wider than shoulder width', 'Land softly on balls of feet', 'Keep a rhythm'],
      checks: [
        { label: 'Left Arm', joints: [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_WRIST], goodMin: 20, goodMax: 180 },
        { label: 'Right Arm', joints: [LM.RIGHT_HIP, LM.RIGHT_SHOULDER, LM.RIGHT_WRIST], goodMin: 20, goodMax: 180 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_HIP, LM.LEFT_SHOULDER, LM.LEFT_WRIST],
        upMin: 140, upMax: 200,
        downMin: 10, downMax: 60
      }
    }
  ],
  Kabaddi: [
    {
      name: 'Deep Squats',
      desc: 'Perform deep squats with proper form. Go as low as you can while keeping your back straight.',
      targetReps: 10,
      tips: ['Aim for thighs parallel to ground', 'Keep heels on the floor', 'Back straight, chest up', 'Arms forward for balance'],
      checks: [
        { label: 'Left Knee', joints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE], goodMin: 60, goodMax: 170 },
        { label: 'Right Knee', joints: [LM.RIGHT_HIP, LM.RIGHT_KNEE, LM.RIGHT_ANKLE], goodMin: 60, goodMax: 170 },
        { label: 'Back Straight', joints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], goodMin: 130, goodMax: 200 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
        upMin: 155, upMax: 180,
        downMin: 50, downMax: 110
      }
    },
    {
      name: 'Side Lunges',
      desc: 'Step sideways into a lunge, bending one knee while keeping the other leg straight. Alternate sides.',
      targetReps: 10,
      tips: ['Keep chest up', 'Bent knee tracks over toes', 'Push hips back', 'Return to center between reps'],
      checks: [
        { label: 'Bent Knee', joints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE], goodMin: 60, goodMax: 170 },
        { label: 'Torso', joints: [LM.LEFT_SHOULDER, LM.LEFT_HIP, LM.LEFT_KNEE], goodMin: 120, goodMax: 200 }
      ],
      repLogic: {
        angleJoints: [LM.LEFT_HIP, LM.LEFT_KNEE, LM.LEFT_ANKLE],
        upMin: 155, upMax: 180,
        downMin: 60, downMax: 120
      }
    }
  ]
};

// ---------- Global state ----------
let poseLandmarker = null;
let webcamStream = null;
let lastVideoTime = -1;
let animFrameId = null;

let currentSport = '';
let exercises = [];
let currentExIdx = 0;
let repState = 'UP'; // UP or DOWN
let reps = 0;
let goodFrames = 0;
let badFrames = 0;
let totalFrames = 0;
let exerciseResults = [];

// DOM refs
const preStart = document.getElementById('preStart');
const assessScreen = document.getElementById('assessScreen');
const scoreModal = document.getElementById('scoreModal');
const startBtn = document.getElementById('startBtn');
const video = document.getElementById('webcam');
const canvas = document.getElementById('poseCanvas');
const ctx = canvas.getContext('2d');
const cameraLoading = document.getElementById('cameraLoading');
const postureStatus = document.getElementById('postureStatus');
const repCurrent = document.getElementById('repCurrent');
const repTotal = document.getElementById('repTotal');
const exerciseNumber = document.getElementById('exerciseNumber');
const exerciseName = document.getElementById('exerciseName');
const exerciseDesc = document.getElementById('exerciseDesc');
const angleChecks = document.getElementById('angleChecks');
const tipsList = document.getElementById('tipsList');
const progressBar = document.getElementById('progressBar');
const goodCount = document.getElementById('goodCount');
const badCount = document.getElementById('badCount');
const skipExercise = document.getElementById('skipExercise');

let drawingUtils;

// ---------- Initialize MediaPipe ----------
async function initPose() {
  const visionModule = await import(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18'
  );
  PoseLandmarker = visionModule.PoseLandmarker;
  FilesetResolver = visionModule.FilesetResolver;
  DrawingUtils = visionModule.DrawingUtils;

  const vision = await FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
  );

  const modelAssetPath =
    'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

  const options = {
    baseOptions: { modelAssetPath },
    runningMode: 'VIDEO',
    numPoses: 1,
    minPoseDetectionConfidence: 0.5,
    minPosePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5
  };

  try {
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { modelAssetPath, delegate: 'GPU' }
    });
  } catch (gpuError) {
    console.warn('GPU MediaPipe initialization failed. Falling back to CPU.', gpuError);
    poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      ...options,
      baseOptions: { modelAssetPath, delegate: 'CPU' }
    });
  }

  drawingUtils = new DrawingUtils(ctx);
}

// ---------- Start webcam ----------
async function startWebcam() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error(
      'Camera API is unavailable. Open this site on localhost/HTTPS and use Chrome or Edge.'
    );
  }

  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 640 },
        height: { ideal: 480 },
        facingMode: { ideal: 'user' }
      }
    });
  } catch (err) {
    if (err.name === 'OverconstrainedError') {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: true
      });
    } else {
      throw err;
    }
  }

  webcamStream = stream;
  video.srcObject = stream;
  const diagnostic = document.getElementById('cameraDiagnostic');
  if (diagnostic) {
    diagnostic.textContent = 'Camera: connected';
    diagnostic.className = 'camera-diagnostic ok';
  }
  video.muted = true;
  video.playsInline = true;
  video.autoplay = true;

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('The webcam opened but did not provide video frames.')),
      10000
    );

    const ready = async () => {
      clearTimeout(timeout);
      try {
        await video.play();
        canvas.width = video.videoWidth || 640;
        canvas.height = video.videoHeight || 480;
        resolve();
      } catch (e) {
        reject(e);
      }
    };

    if (video.readyState >= 2) ready();
    else video.addEventListener('loadedmetadata', ready, { once: true });
  });
}

// ---------- Stop webcam ----------
function stopWebcam() {
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (webcamStream) {
    webcamStream.getTracks().forEach(t => t.stop());
    webcamStream = null;
  }
  video.srcObject = null;
}

// ---------- Load exercise UI ----------
function loadExercise(idx) {
  const ex = exercises[idx];
  currentExIdx = idx;
  reps = 0;
  repState = 'UP';
  goodFrames = 0;
  badFrames = 0;
  totalFrames = 0;

  exerciseNumber.textContent = `Exercise ${idx + 1} of ${exercises.length}`;
  exerciseName.textContent = ex.name;
  exerciseDesc.textContent = ex.desc;
  repCurrent.textContent = '0';
  repTotal.textContent = ex.targetReps;
  progressBar.style.width = '0%';
  goodCount.textContent = '0';
  badCount.textContent = '0';

  tipsList.innerHTML = '';
  ex.tips.forEach(tip => {
    const li = document.createElement('li');
    li.textContent = tip;
    tipsList.appendChild(li);
  });

  angleChecks.innerHTML = '';
  ex.checks.forEach(check => {
    const div = document.createElement('div');
    div.className = 'angle-check-item';
    div.id = 'check_' + check.label.replace(/\s/g, '_');
    div.innerHTML = `<span class="check-label">${check.label}</span><span class="check-value">--°</span><span class="check-status">⏳</span>`;
    angleChecks.appendChild(div);
  });
}

// ---------- Detection loop ----------
function detectLoop() {
  if (!poseLandmarker || !video.srcObject) return;

  if (video.currentTime !== lastVideoTime && video.readyState >= 2) {
    lastVideoTime = video.currentTime;
    const results = poseLandmarker.detectForVideo(video, performance.now());

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.landmarks && results.landmarks.length > 0) {
      const lm = results.landmarks[0];
      const ex = exercises[currentExIdx];

      // Evaluate posture
      const evaluation = evaluatePose(lm, ex);

      // Draw skeleton
      const color = evaluation.isGood ? '#22c55e' : '#ef4444';
      const pointColor = evaluation.isGood ? '#16a34a' : '#dc2626';

      drawingUtils.drawConnectors(lm, PoseLandmarker.POSE_CONNECTIONS, {
        color: color, lineWidth: 3
      });
      drawingUtils.drawLandmarks(lm, {
        color: pointColor, lineWidth: 1, radius: 3
      });

      // Update posture status
      updatePostureUI(evaluation);

      // Rep counting
      countRep(lm, ex, evaluation.isGood);

      // Track frames
      totalFrames++;
      if (evaluation.isGood) goodFrames++; else badFrames++;
      goodCount.textContent = goodFrames;
      badCount.textContent = badFrames;
    }
  }

  animFrameId = requestAnimationFrame(detectLoop);
}

// ---------- Evaluate pose against exercise checks ----------
function evaluatePose(landmarks, exercise) {
  let allGood = true;
  const details = [];

  exercise.checks.forEach(check => {
    const [a, b, c] = check.joints;
    const angle = calcAngle(landmarks[a], landmarks[b], landmarks[c]);
    const isGood = angle >= check.goodMin && angle <= check.goodMax;
    if (!isGood) allGood = false;

    details.push({ label: check.label, angle: Math.round(angle), isGood });

    // Update UI
    const el = document.getElementById('check_' + check.label.replace(/\s/g, '_'));
    if (el) {
      el.querySelector('.check-value').textContent = Math.round(angle) + '°';
      el.querySelector('.check-status').textContent = isGood ? '✅' : '❌';
      el.className = 'angle-check-item ' + (isGood ? 'good' : 'bad');
    }
  });

  return { isGood: allGood, details };
}

// ---------- Update posture feedback UI ----------
function updatePostureUI(evaluation) {
  const statusEl = postureStatus;
  if (evaluation.isGood) {
    statusEl.className = 'posture-status good';
    statusEl.querySelector('.posture-icon').textContent = '✅';
    statusEl.querySelector('.posture-text').textContent = 'Good Form!';
  } else {
    statusEl.className = 'posture-status bad';
    statusEl.querySelector('.posture-icon').textContent = '⚠️';
    // Find which check failed
    const badCheck = evaluation.details.find(d => !d.isGood);
    statusEl.querySelector('.posture-text').textContent = badCheck
      ? `Fix: ${badCheck.label} (${badCheck.angle}º)`
      : 'Fix Your Posture!';
  }
}

// ---------- Rep counting state machine ----------
function countRep(landmarks, exercise, isGoodForm) {
  const rl = exercise.repLogic;
  const [a, b, c] = rl.angleJoints;
  const angle = calcAngle(landmarks[a], landmarks[b], landmarks[c]);

  if (repState === 'UP' && angle >= rl.downMin && angle <= rl.downMax) {
    repState = 'DOWN';
  } else if (repState === 'DOWN' && angle >= rl.upMin && angle <= rl.upMax) {
    repState = 'UP';
    reps++;
    repCurrent.textContent = reps;

    // Update progress
    const pct = Math.min(100, (reps / exercise.targetReps) * 100);
    progressBar.style.width = pct + '%';

    // Check if exercise complete
    if (reps >= exercise.targetReps) {
      completeExercise();
    }
  }
}

// ---------- Complete current exercise ----------
function completeExercise() {
  const ex = exercises[currentExIdx];
  const accuracy = totalFrames > 0 ? Math.round((goodFrames / totalFrames) * 100) : 0;

  exerciseResults.push({
    name: ex.name,
    reps: reps,
    targetReps: ex.targetReps,
    goodFrames,
    badFrames,
    totalFrames,
    accuracy
  });

  // Move to next exercise or show score
  if (currentExIdx + 1 < exercises.length) {
    // Brief transition
    showTransition(ex.name, currentExIdx + 1);
  } else {
    showScore();
  }
}

// ---------- Transition between exercises ----------
function showTransition(completedName, nextIdx) {
  const overlay = document.createElement('div');
  overlay.className = 'exercise-transition';
  overlay.innerHTML = `
    <div class="transition-content">
      <div class="transition-check">✅</div>
      <h2>${completedName} Complete!</h2>
      <p>Get ready for: <strong>${exercises[nextIdx].name}</strong></p>
      <div class="transition-countdown" id="transCountdown">3</div>
    </div>
  `;
  document.querySelector('.camera-area').appendChild(overlay);

  let count = 3;
  const countdownEl = overlay.querySelector('#transCountdown');
  const interval = setInterval(() => {
    count--;
    countdownEl.textContent = count;
    if (count <= 0) {
      clearInterval(interval);
      overlay.remove();
      loadExercise(nextIdx);
    }
  }, 1000);
}

// ---------- Show final score ----------
function showScore() {
  // Stop detection
  if (animFrameId) cancelAnimationFrame(animFrameId);

  // Calculate overall score
  const totalAccuracy = exerciseResults.reduce((sum, r) => sum + r.accuracy, 0);
  const avgAccuracy = Math.round(totalAccuracy / exerciseResults.length);
  const repCompletion = exerciseResults.reduce((sum, r) => sum + Math.min(100, (r.reps / r.targetReps) * 100), 0) / exerciseResults.length;
  const overallScore = Math.round(avgAccuracy * 0.6 + repCompletion * 0.4); // 60% form, 40% completion

  // Hide assessment, show score modal
  assessScreen.classList.add('hidden');
  scoreModal.classList.remove('hidden');

  // Animate score circle
  const arc = document.getElementById('scoreArc');
  const circumference = 327; // 2 * π * 52
  const offset = circumference - (overallScore / 100) * circumference;
  setTimeout(() => {
    arc.style.transition = 'stroke-dashoffset 1.5s ease';
    arc.style.strokeDashoffset = offset;

    // Color based on score
    if (overallScore >= 80) arc.style.stroke = '#22c55e';
    else if (overallScore >= 50) arc.style.stroke = '#f59e0b';
    else arc.style.stroke = '#ef4444';
  }, 100);

  // Animate number
  animateNumber(document.getElementById('scoreNumber'), 0, overallScore, 1500);

  // Breakdown
  const breakdown = document.getElementById('scoreBreakdown');
  breakdown.innerHTML = exerciseResults.map(r => `
    <div class="breakdown-row">
      <span class="breakdown-name">${r.name}</span>
      <span class="breakdown-reps">${r.reps}/${r.targetReps} reps</span>
      <span class="breakdown-acc ${r.accuracy >= 70 ? 'good' : 'warn'}">${r.accuracy}% form</span>
    </div>
  `).join('');

}

function animateNumber(el, from, to, duration) {
  const start = performance.now();
  function step(ts) {
    const progress = Math.min((ts - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(from + (to - from) * eased);
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ---------- Skip exercise ----------
skipExercise.addEventListener('click', () => {
  const ex = exercises[currentExIdx];
  const accuracy = totalFrames > 0 ? Math.round((goodFrames / totalFrames) * 100) : 0;
  exerciseResults.push({
    name: ex.name,
    reps, targetReps: ex.targetReps,
    goodFrames, badFrames, totalFrames,
    accuracy
  });

  if (currentExIdx + 1 < exercises.length) {
    loadExercise(currentExIdx + 1);
  } else {
    showScore();
  }
});

// ---------- Start button ----------
startBtn.addEventListener('click', async () => {
  startBtn.disabled = true;
  startBtn.innerHTML = '<span class="spinner"></span> Opening camera…';

  try {
    // IMPORTANT: camera starts independently of MediaPipe.
    // This means a CDN/model problem cannot prevent the webcam from opening.
    await startWebcam();

    preStart.classList.add('hidden');
    assessScreen.classList.remove('hidden');
    cameraLoading.classList.remove('hidden');
    cameraLoading.querySelector('p').textContent = 'Camera ready. Loading AI pose detection…';

    loadExercise(0);

    // Load AI only after the camera is already visible.
    try {
      await initPose();
      cameraLoading.classList.add('hidden');
      detectLoop();
    } catch (aiError) {
      console.error('Pose AI failed after camera started:', aiError);
      cameraLoading.querySelector('p').innerHTML =
        'Camera is working, but AI pose detection could not load.<br><small>' +
        (aiError.message || 'Check your internet connection and reload.') +
        '</small>';
      // Keep the camera visible instead of failing the entire exercise screen.
    }

    startBtn.innerHTML = '📷 Camera Running';
  } catch (err) {
    console.error('Camera startup error:', err);
    const diagnostic = document.getElementById('cameraDiagnostic');
    if (diagnostic) {
      diagnostic.textContent = 'Camera: error';
      diagnostic.className = 'camera-diagnostic error';
    }
    startBtn.disabled = false;
    startBtn.innerHTML = '📷 Start Camera & Begin';

    let msg = 'Camera could not start. ';
    if (err.name === 'NotAllowedError') {
      msg += 'Camera permission is blocked. Click the camera icon beside the address bar and choose Allow.';
    } else if (err.name === 'NotFoundError') {
      msg += 'No webcam was found.';
    } else if (err.name === 'NotReadableError') {
      msg += 'The webcam is already being used by another application.';
    } else if (err.name === 'SecurityError') {
      msg += 'Browser security blocked camera access. Use http://localhost or HTTPS.';
    } else {
      msg += err.message || 'Use Chrome/Edge on localhost and try again.';
    }

    alert(msg);
  }
});

// ---------- Cleanup on page leave ----------
window.addEventListener('beforeunload', stopWebcam);
    
    // Add logic to bind MediaPipe dynamically since SPORT is determined via routing
    window.initAssessmentModule = (sportName) => {
      currentSport = sportName;
      exercises = EXERCISES[currentSport] || EXERCISES.Cricket;
      const icons = { 'Cricket':'🏏','Football':'⚽','Running':'🏃','Kabaddi':'🤾' };
      document.getElementById('assessSportBadge').innerHTML = `${icons[currentSport]||'🎯'} ${currentSport} Assessment`;
      document.getElementById('assessUserName').textContent = currentUser.name;
      document.getElementById('assessSportIcon').textContent = icons[currentSport]||'🎯';
      document.getElementById('assessSportTitle').textContent = `${currentSport} Live Assessment`;
      document.getElementById('scoreSportName').textContent = `${icons[currentSport]||'🎯'} ${currentSport}`;

      const list = document.getElementById('exerciseList');
      list.innerHTML = '';
      exercises.forEach((ex, i) => {
        const div = document.createElement('div');
        div.className = 'exercise-preview-item';
        div.innerHTML = `<span class="ex-num">${i + 1}</span><div><strong>${ex.name}</strong><p>${ex.desc}</p></div>`;
        list.appendChild(div);
      });

      document.getElementById('preStart').classList.remove('hidden');
      document.getElementById('assessScreen').classList.add('hidden');
      document.getElementById('scoreModal').classList.add('hidden');
      document.getElementById('startBtn').disabled = false;
      document.getElementById('startBtn').innerHTML = '📷 Start Camera & Begin';
      exerciseResults = [];
      if (animFrameId) cancelAnimationFrame(animFrameId);
      stopWebcam();
    };

    // Monkey-patch saveResults to save to localStorage
    window.saveResults = function(score) {
      const ass = { sport: currentSport, score: score, exercises: exerciseResults, completedAt: new Date().toISOString() };
      if (!currentUser.assessments) currentUser.assessments = [];
      const idx = currentUser.assessments.findIndex(a => a.sport === currentSport);
      if (idx >= 0) currentUser.assessments[idx] = ass;
      else currentUser.assessments.push(ass);
      saveUser();
      navigate('#dashboard');
    };

    document.getElementById('saveContinue').onclick = () => window.saveResults(document.getElementById('scoreNumber').textContent);
    document.getElementById('retryBtn').onclick = () => window.initAssessmentModule(currentSport);