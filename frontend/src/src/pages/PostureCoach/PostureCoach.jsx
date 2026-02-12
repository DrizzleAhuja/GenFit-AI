import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { API_BASE_URL } from "../../../config/api";
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
  const user = useSelector(selectUser);
  const [exercise, setExercise] = useState("squat");
  const [isRunning, setIsRunning] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);
  const [lastError, setLastError] = useState(null);
  const [reps, setReps] = useState(0);
  const [calories, setCalories] = useState(0);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [newRepAnimation, setNewRepAnimation] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState(null);
  const [visibilityMessage, setVisibilityMessage] = useState("");
  const [sessionHistory, setSessionHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

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

  // Fetch last 15 days of posture/virtual training sessions for logged-in user
  useEffect(() => {
    const fetchHistory = async () => {
      if (!user?._id) {
        setSessionHistory([]);
        return;
      }
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/posture/sessions/${user._id}?days=15`
        );
        if (!res.ok) {
          throw new Error("Failed to load session history");
        }
        const data = await res.json();
        if (data?.success) {
          setSessionHistory(data.sessions || []);
        } else {
          setHistoryError("Failed to load session history");
        }
      } catch (err) {
        console.error("Posture history fetch error:", err);
        setHistoryError(
          err.message || "Failed to load session history"
        );
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchHistory();
  }, [user?._id]);

  // Enumerate available cameras and prefer back camera on phones
  useEffect(() => {
    async function loadCameras() {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          return;
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter((d) => d.kind === "videoinput");
        setCameras(videoInputs);

        if (!selectedCameraId && videoInputs.length > 0) {
          const backCam =
            videoInputs.find((d) =>
              /back|rear|environment/i.test(d.label || "")
            ) || videoInputs[0];
          setSelectedCameraId(backCam.deviceId);
        }
      } catch (err) {
        console.error("Failed to enumerate cameras", err);
      }
    }

    loadCameras();
  }, [selectedCameraId]);

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

    // ---- General joint angle annotations (for visual richness on all exercises) ----
    const toNamed = {};
    pose.keypoints.forEach((kp) => {
      const rawName = kp?.name || kp?.part || kp?.id;
      if (!rawName) return;
      toNamed[String(rawName).toLowerCase()] = kp;
    });

    const getKp = (name) => toNamed[name.toLowerCase()];

    const angleAt = (a, b, c) => {
      if (!a || !b || !c) return null;
      const v1 = { x: a.x - b.x, y: a.y - b.y };
      const v2 = { x: c.x - b.x, y: c.y - b.y };
      const dot = v1.x * v2.x + v1.y * v2.y;
      const mag1 = Math.hypot(v1.x, v1.y);
      const mag2 = Math.hypot(v2.x, v2.y);
      if (!mag1 || !mag2) return null;
      const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));
      return (Math.acos(cos) * 180) / Math.PI;
    };

    const jointConfigs = [
      { label: "L Knee", a: "left_hip", b: "left_knee", c: "left_ankle" },
      { label: "R Knee", a: "right_hip", b: "right_knee", c: "right_ankle" },
      { label: "L Elbow", a: "left_shoulder", b: "left_elbow", c: "left_wrist" },
      { label: "R Elbow", a: "right_shoulder", b: "right_elbow", c: "right_wrist" },
      { label: "L Hip", a: "left_shoulder", b: "left_hip", c: "left_knee" },
      { label: "R Hip", a: "right_shoulder", b: "right_hip", c: "right_knee" },
      { label: "Neck", a: "left_shoulder", b: "nose", c: "right_shoulder" },
    ];

    ctx.font = "10px system-ui";
    ctx.fillStyle = "#e5e7eb"; // light gray text

    jointConfigs.forEach((joint) => {
      const a = getKp(joint.a);
      const b = getKp(joint.b);
      const c = getKp(joint.c);
      if (!a || !b || !c) return;
      if ((a.score || 0) < 0.3 || (b.score || 0) < 0.3 || (c.score || 0) < 0.3) return;

      const angle = angleAt(a, b, c);
      if (!angle) return;

      // Small subtle marker at the joint plus angle value
      ctx.beginPath();
      ctx.arc(b.x, b.y, 4, 0, 2 * Math.PI);
      ctx.strokeStyle = "#a855f7"; // violet accent
      ctx.lineWidth = 1;
      ctx.stroke();

      const text = `${Math.round(angle)}°`;
      const textX = b.x + 6;
      const textY = b.y - 6;

      ctx.fillStyle = "rgba(15, 23, 42, 0.85)"; // dark backdrop
      const padding = 2;
      const metrics = ctx.measureText(text);
      const boxWidth = metrics.width + padding * 2;
      const boxHeight = 10 + padding * 2;

      ctx.fillRect(textX - padding, textY - boxHeight + padding, boxWidth, boxHeight);
      ctx.fillStyle = "#e5e7eb";
      ctx.fillText(text, textX, textY);
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

  const logSession = useCallback(
    async (snapshot) => {
      try {
        if (!user?._id) {
          return;
        }
        const payload = {
          userId: user._id,
          exerciseType: snapshot.exercise,
          reps: snapshot.reps,
          calories: snapshot.calories,
          durationSeconds: snapshot.sessionDuration,
          date: new Date().toISOString(),
        };

        const res = await fetch(`${API_BASE_URL}/api/posture/session-log`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error("Failed to log posture session");
          return;
        }
        const data = await res.json();
        if (data?.success && data.session) {
          setSessionHistory((prev) => [data.session, ...prev].slice(0, 200));
        }
      } catch (err) {
        console.error("Error logging posture session:", err);
      }
    },
    [user]
  );

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
        // Check overall body visibility based on keypoint confidence
        const visibleKeypoints = pose.keypoints.filter(
          (kp) => kp && (kp.score || 0) > 0.3
        );
        const visibilityRatio =
          pose.keypoints.length > 0
            ? visibleKeypoints.length / pose.keypoints.length
            : 0;

        // Require at least ~50% of keypoints confidently visible
        const bodyVisible = visibilityRatio >= 0.5;

        const ctx = canvas.getContext("2d");
        drawSkeleton(pose, ctx, videoWidth, videoHeight, exercise, repCounterRef.current);

        if (!bodyVisible) {
          setVisibilityMessage(
            "Human body not clearly visible. Step back and make sure your full body is in the frame."
          );
        } else {
          if (visibilityMessage) setVisibilityMessage("");

          // Update rep counter only when body is visible
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
      } else {
        // No pose detected at all
        setVisibilityMessage(
          "No human body detected. Step back and ensure your body is clearly visible to the camera."
        );
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
    if (isRunning) {
      const snapshot = {
        exercise,
        reps,
        calories,
        sessionDuration,
      };
      if (snapshot.reps > 0 || snapshot.sessionDuration > 0) {
        logSession(snapshot);
      }
      // Reset counters when stopping
      if (repCounterRef.current) {
        repCounterRef.current.reset();
      }
      setReps(0);
      setCalories(0);
      setSessionDuration(0);
      lastGoodScoreRef.current = false;
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
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
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
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
                {cameras.length > 0 && (
                  <div className="flex items-center gap-2 text-xs md:text-sm">
                    <span className="text-gray-400 whitespace-nowrap">
                      Camera:
                    </span>
                    <select
                      className="bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-gray-100"
                      value={selectedCameraId || ""}
                      onChange={(e) =>
                        setSelectedCameraId(e.target.value || null)
                      }
                    >
                      {cameras.map((cam, idx) => (
                        <option key={cam.deviceId || idx} value={cam.deviceId}>
                          {cam.label || `Camera ${idx + 1}`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
                  deviceId: selectedCameraId || undefined,
                  facingMode: selectedCameraId ? undefined : "user",
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />
              {visibilityMessage && !isModelLoading && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-red-500/80 text-white text-[11px] md:text-xs px-3 py-1 rounded-full shadow-lg">
                  {visibilityMessage}
                </div>
              )}
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

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <h2 className="text-sm font-semibold text-gray-100 mb-2">
                Last 15 Days History
              </h2>
              {!user && (
                <p className="text-xs text-gray-400">
                  Sign in to save your coaching sessions and see history here.
                </p>
              )}
              {user && historyLoading && (
                <p className="text-xs text-gray-400">Loading history…</p>
              )}
              {user && !historyLoading && historyError && (
                <p className="text-xs text-red-400">{historyError}</p>
              )}
              {user &&
                !historyLoading &&
                !historyError &&
                sessionHistory.length === 0 && (
                  <p className="text-xs text-gray-400">
                    No sessions logged yet. Finish a coaching session and tap
                    “Stop Coaching” to save it.
                  </p>
                )}
              {user &&
                !historyLoading &&
                !historyError &&
                sessionHistory.length > 0 && (
                  <ul className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                    {sessionHistory.map((s) => {
                      const d = new Date(s.date);
                      return (
                        <li
                          key={s._id}
                          className="text-[11px] text-gray-200 border border-gray-700 rounded-lg px-3 py-2 bg-gray-900/60"
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold capitalize">
                              {s.exerciseType.replace(/_/g, " ")}
                            </span>
                            <span className="text-gray-400">
                              {d.toLocaleDateString()}{" "}
                              {d.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-3 text-[10px] text-gray-300">
                            <span>
                              Reps:{" "}
                              <span className="font-semibold">
                                {s.reps ?? 0}
                              </span>
                            </span>
                            <span>
                              Calories:{" "}
                              <span className="font-semibold">
                                {typeof s.calories === "number"
                                  ? s.calories.toFixed(1)
                                  : "0.0"}
                              </span>
                            </span>
                            <span>
                              Time:{" "}
                              <span className="font-semibold">
                                {formatTime(s.durationSeconds || 0)}
                              </span>
                            </span>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
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


