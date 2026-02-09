import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { analyzePosture } from "../../utils/postureService";
import { RepCounter, calculateCaloriesBurned } from "../../utils/repCounter";

const EXERCISES = [
  { id: "posture", label: "Posture" },
  { id: "squat", label: "Squat" },
  { id: "lunge", label: "Lunge" },
  { id: "pushup", label: "Push-up" },
  { id: "plank", label: "Plank" },
  { id: "bicep_curl", label: "Bicep Curl" },
  { id: "shoulder_press", label: "Shoulder Press" },
  { id: "lateral_raise", label: "Lateral Raise" },
  { id: "deadlift", label: "Deadlift" },
  { id: "bent_over_row", label: "Bent-over Row" },
  { id: "tricep_extension", label: "Tricep Extension" },
  { id: "side_plank", label: "Side Plank" },
  { id: "high_knees", label: "High Knees" },
  { id: "jumping_jack", label: "Jumping Jack" },
  { id: "mountain_climber", label: "Mountain Climber" },
];

export default function PostureCoach() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const repCounterRef = useRef(null);
  const sessionStartTimeRef = useRef(null);
  const lastGoodScoreRef = useRef(false);
  const [exercise, setExercise] = useState("squat");
  const [isRunning, setIsRunning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [reps, setReps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [newRepAnimation, setNewRepAnimation] = useState(false);

  // Initialize rep counter and reset when exercise changes
  useEffect(() => {
    if (!repCounterRef.current) {
      repCounterRef.current = new RepCounter(exercise);
    } else {
      repCounterRef.current.setExerciseType(exercise);
    }
    // Reset reps when exercise changes
    setReps(0);
    setCalories(0);
    lastGoodScoreRef.current = false;
  }, [exercise]);

  // Track session duration and update calories
  useEffect(() => {
    let intervalId = null;
    
    if (isRunning) {
      sessionStartTimeRef.current = Date.now();
      intervalId = setInterval(() => {
        const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        setSessionDuration(duration);
        
        // Only calculate calories if we have reps OR if it's a time-based exercise
        if (exercise === 'plank' || exercise === 'posture' || exercise === 'side_plank') {
          // For time-based exercises, use duration
          const caloriesBurned = calculateCaloriesBurned(
            exercise,
            0,
            duration
          );
          setCalories(caloriesBurned);
        } else {
          // For rep-based exercises, only count calories when reps are done
          // Use reps to estimate calories (more accurate than time alone)
          if (reps > 0) {
            const caloriesBurned = calculateCaloriesBurned(
              exercise,
              reps,
              0 // Let it calculate from reps
            );
            setCalories(caloriesBurned);
          } else {
            // No reps yet, don't count calories
            setCalories(0);
          }
        }
      }, 1000); // Update every second
    } else {
      // Reset when stopped
      if (sessionStartTimeRef.current) {
        sessionStartTimeRef.current = null;
      }
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, exercise, reps]);

  // Load pose detector once, ensuring TF backend is ready
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Force a known backend to avoid webgpu init issues
        setIsModelLoading(true);
        await tf.setBackend("webgl");
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: "SinglePose.Lightning" }
        );

        if (!cancelled) {
          detectorRef.current = detector;
          setIsModelLoading(false);
        }
      } catch (e) {
        console.error("Failed to load pose detector", e);
        setLastError(
          "Failed to load pose detector. Check browser support or try refreshing the page."
        );
        setIsModelLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const drawSkeleton = useCallback((pose, ctx, width, height, exerciseType, repCounter) => {
    if (!pose || !pose.keypoints) return;
    
    ctx.clearRect(0, 0, width, height);
    
    // Draw skeleton connections
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const adjacentPairs = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.MoveNet
    );
    
    adjacentPairs.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });

    // Draw keypoints
    ctx.fillStyle = "#22c55e";
    pose.keypoints.forEach((kp) => {
      if (kp && kp.score > 0.3) {
        ctx.beginPath();
        ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    // Draw exercise-specific angle lines and measurements
    if (repCounter && exerciseType !== 'posture' && exerciseType !== 'plank' && exerciseType !== 'side_plank') {
      const keypoints = pose.keypoints.map((kp) => ({
        name: kp.name || kp.part || kp.id,
        x: kp.x,
        y: kp.y,
        score: kp.score,
      }));

      ctx.strokeStyle = "#fbbf24"; // Yellow for angle lines
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      // Draw angle lines based on exercise type
      const getKp = (name) => {
        return keypoints.find(kp => {
          const kpName = (kp.name || kp.part || kp.id || '').toLowerCase();
          return kpName.includes(name.toLowerCase());
        });
      };

      if (exerciseType === 'squat' || exerciseType === 'deadlift' || exerciseType === 'high_knees' || exerciseType === 'jumping_jack' || exerciseType === 'mountain_climber') {
        const leftHip = getKp('left_hip');
        const leftKnee = getKp('left_knee');
        const leftAnkle = getKp('left_ankle');
        const rightHip = getKp('right_hip');
        const rightKnee = getKp('right_knee');
        const rightAnkle = getKp('right_ankle');

        // Draw left leg angle
        if (leftHip && leftKnee && leftAnkle && 
            leftHip.score > 0.3 && leftKnee.score > 0.3 && leftAnkle.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(leftHip.x, leftHip.y);
          ctx.lineTo(leftKnee.x, leftKnee.y);
          ctx.lineTo(leftAnkle.x, leftAnkle.y);
          ctx.stroke();
        }

        // Draw right leg angle
        if (rightHip && rightKnee && rightAnkle &&
            rightHip.score > 0.3 && rightKnee.score > 0.3 && rightAnkle.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(rightHip.x, rightHip.y);
          ctx.lineTo(rightKnee.x, rightKnee.y);
          ctx.lineTo(rightAnkle.x, rightAnkle.y);
          ctx.stroke();
        }
      } else if (
        exerciseType === 'pushup' ||
        exerciseType === 'bicep_curl' ||
        exerciseType === 'shoulder_press' ||
        exerciseType === 'lateral_raise' ||
        exerciseType === 'bent_over_row' ||
        exerciseType === 'tricep_extension'
      ) {
        const leftShoulder = getKp('left_shoulder');
        const leftElbow = getKp('left_elbow');
        const leftWrist = getKp('left_wrist');
        const rightShoulder = getKp('right_shoulder');
        const rightElbow = getKp('right_elbow');
        const rightWrist = getKp('right_wrist');

        // Draw left arm angle
        if (leftShoulder && leftElbow && leftWrist &&
            leftShoulder.score > 0.3 && leftElbow.score > 0.3 && leftWrist.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(leftShoulder.x, leftShoulder.y);
          ctx.lineTo(leftElbow.x, leftElbow.y);
          ctx.lineTo(leftWrist.x, leftWrist.y);
          ctx.stroke();
        }

        // Draw right arm angle
        if (rightShoulder && rightElbow && rightWrist &&
            rightShoulder.score > 0.3 && rightElbow.score > 0.3 && rightWrist.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(rightShoulder.x, rightShoulder.y);
          ctx.lineTo(rightElbow.x, rightElbow.y);
          ctx.lineTo(rightWrist.x, rightWrist.y);
          ctx.stroke();
        }
      } else if (exerciseType === 'lunge') {
        const leftHip = getKp('left_hip');
        const leftKnee = getKp('left_knee');
        const leftAnkle = getKp('left_ankle');

        if (leftHip && leftKnee && leftAnkle &&
            leftHip.score > 0.3 && leftKnee.score > 0.3 && leftAnkle.score > 0.3) {
          ctx.beginPath();
          ctx.moveTo(leftHip.x, leftHip.y);
          ctx.lineTo(leftKnee.x, leftKnee.y);
          ctx.lineTo(leftAnkle.x, leftAnkle.y);
          ctx.stroke();
        }
      }

      ctx.setLineDash([]); // Reset line dash
    }
  }, []);

  const loopRef = useRef(null);
  const lastSentRef = useRef(0);

  const captureLoop = useCallback(async () => {
    if (!detectorRef.current || !webcamRef.current || !canvasRef.current) return;
    if (!isRunning) return;

    const video = webcamRef.current.video;
    if (!video || video.readyState !== 4) {
      loopRef.current = requestAnimationFrame(captureLoop);
      return;
    }

    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    video.width = videoWidth;
    video.height = videoHeight;

    const canvas = canvasRef.current;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    try {
      const poses = await detectorRef.current.estimatePoses(video);
      const pose = poses[0];
      if (pose) {
        const ctx = canvas.getContext("2d");
        drawSkeleton(pose, ctx, videoWidth, videoHeight, exercise, repCounterRef.current);

        // Update rep counter
        if (repCounterRef.current && isRunning) {
          const keypoints = pose.keypoints.map((kp) => ({
            name: kp.name || kp.part || kp.id,
            x: kp.x,
            y: kp.y,
            score: kp.score,
          }));
          
          const repResult = repCounterRef.current.update(keypoints);
          if (repResult.newRep) {
            setReps(repResult.reps);
            // Trigger animation
            setNewRepAnimation(true);
            setTimeout(() => setNewRepAnimation(false), 500);
          }
        }

        const now = Date.now();
        if (now - lastSentRef.current > 500) {
          lastSentRef.current = now;
          const landmarks = pose.keypoints.map((kp) => ({
            name: kp.name || kp.part || kp.id,
            x: kp.x,
            y: kp.y,
            score: kp.score,
          }));
          analyzePosture(exercise, landmarks)
            .then((res) => {
              if (res?.success && res.analysis) {
                setAnalysis(res.analysis);

                // Score-based rep counting: if score > 60 and it just crossed that threshold,
                // treat it as a "good rep" for rep-based exercises.
                const score = res.analysis.score || 0;
                const isTimeBased =
                  exercise === "plank" ||
                  exercise === "posture" ||
                  exercise === "side_plank";

                if (!isTimeBased) {
                  const isGoodNow = score > 60;
                  if (isGoodNow && !lastGoodScoreRef.current) {
                    setReps((prev) => prev + 1);
                    // Trigger animation
                    setNewRepAnimation(true);
                    setTimeout(() => setNewRepAnimation(false), 500);
                  }
                  lastGoodScoreRef.current = isGoodNow;
                } else {
                  lastGoodScoreRef.current = false;
                }
              }
            })
            .catch((err) => {
              console.error("Posture analysis error", err);
            });
        }
      }
    } catch (err) {
      console.error("Pose detection error", err);
    }

    loopRef.current = requestAnimationFrame(captureLoop);
  }, [drawSkeleton, exercise, isRunning]);

  useEffect(() => {
    if (isRunning) {
      loopRef.current = requestAnimationFrame(captureLoop);
    } else if (loopRef.current) {
      cancelAnimationFrame(loopRef.current);
    }
    return () => {
      if (loopRef.current) cancelAnimationFrame(loopRef.current);
    };
  }, [isRunning, captureLoop]);

  const toggleRunning = () => {
    setIsRunning((prev) => {
      const newState = !prev;
      if (!newState) {
        // Reset counters when stopping
        if (repCounterRef.current) {
          repCounterRef.current.reset();
        }
        setReps(0);
        setCalories(0);
        setSessionDuration(0);
        lastGoodScoreRef.current = false;
      }
      return newState;
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dark min-h-screen bg-gray-900 text-gray-100">
      <NavBar />
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-16">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
            Virtual Training Assistant
          </h1>
          <p className="mt-2 text-sm md:text-base text-gray-300">
            Use your phone or laptop camera to get real-time posture feedback on your exercise form.
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {EXERCISES.map((ex) => (
                  <button
                    key={ex.id}
                    onClick={() => setExercise(ex.id)}
                    className={`px-3 py-1.5 rounded-full text-xs md:text-sm border ${
                      exercise === ex.id
                        ? "bg-emerald-500 text-gray-900 border-emerald-400"
                        : "border-gray-600 text-gray-200 hover:bg-gray-800"
                    }`}
                  >
                    {ex.label}
                  </button>
                ))}
              </div>
              <button
                onClick={toggleRunning}
                disabled={isModelLoading || !!lastError}
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  isRunning
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-emerald-500 text-gray-900 hover:bg-emerald-400"
                } ${isModelLoading || lastError ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                {isModelLoading
                  ? "Loading AI model..."
                  : isRunning
                  ? "Stop Coaching"
                  : "Start Coaching"}
              </button>
            </div>

            <div className="relative rounded-2xl overflow-hidden border border-gray-700 bg-black aspect-video">
              <Webcam
                ref={webcamRef}
                mirrored={true}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                videoConstraints={{
                  facingMode: "user",
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              {isModelLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-sm text-gray-100">
                  <div className="mb-2 h-6 w-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                  <p>AI model loading, please wait…</p>
                </div>
              )}
              {!isModelLoading && !isRunning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm text-gray-100">
                  Press <span className="mx-1 font-semibold">Start Coaching</span> to begin.
                </div>
              )}
            </div>
            {lastError && (
              <p className="text-xs text-red-400 mt-1">{lastError}</p>
            )}
          </div>

          <aside className="space-y-4">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-100 mb-3">
                Workout Stats
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div 
                    className={`text-2xl font-bold text-emerald-400 transition-all duration-300 ${
                      newRepAnimation ? 'scale-150 text-emerald-300' : ''
                    }`}
                  >
                    {reps}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Reps</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400">{calories.toFixed(1)}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Calories</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-400">{formatTime(sessionDuration)}</div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">Time</div>
                </div>
              </div>
              {exercise === 'plank' || exercise === 'posture' ? (
                <div className="mt-2 text-xs text-gray-400 text-center">
                  {exercise === 'plank' ? 'Time-based exercise' : 'Posture monitoring'}
                </div>
              ) : null}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-100 mb-2">
                Live Feedback
              </h2>
              {analysis ? (
                <div className="space-y-2 text-xs text-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="uppercase tracking-wide text-[11px] text-gray-400">
                      {analysis.exerciseType}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] ${
                        analysis.isCorrect
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {analysis.isCorrect ? "Good form" : "Needs adjustment"}
                    </span>
                  </div>
                  <div className="text-[11px] text-gray-400">
                    Score:{" "}
                    <span className="font-semibold text-gray-100">
                      {Math.round(analysis.score || 0)}/100
                    </span>
                  </div>
                  {analysis.issues?.length ? (
                    <div className="mt-2">
                      <p className="font-semibold text-[11px] text-amber-300 mb-1">
                        Issues detected:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {analysis.issues.map((msg, idx) => (
                          <li key={idx}>{msg}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="mt-2 text-[11px] text-emerald-300">
                      Looking solid! Keep repeating reps with the same control.
                    </p>
                  )}
                  {analysis.tips?.length && (
                    <div className="mt-3 border-t border-gray-700 pt-2">
                      <p className="font-semibold text-[11px] text-gray-300 mb-1">
                        Coaching tips:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-[11px]">
                        {analysis.tips.map((tip, idx) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-xs text-gray-400">
                  Start the camera and perform a {EXERCISES.find((e) => e.id === exercise)?.label} to see feedback here.
                </p>
              )}
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-xs text-gray-300 space-y-2">
              <h2 className="text-sm font-semibold text-gray-100 mb-1">
                How to use
              </h2>
              <ol className="list-decimal list-inside space-y-1">
                <li>Stand or place your phone so your full body is visible.</li>
                <li>Select an exercise, then tap “Start Coaching”.</li>
                <li>Perform slow, controlled reps and follow the feedback.</li>
              </ol>
              <p className="text-[11px] text-gray-400 mt-1">
                Works in modern mobile and desktop browsers with camera access enabled.
              </p>
            </div>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}


