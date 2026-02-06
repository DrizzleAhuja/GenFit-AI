import React, { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import NavBar from "../HomePage/NavBar";
import Footer from "../HomePage/Footer";
import { analyzePosture } from "../../utils/postureService";

const EXERCISES = [
  { id: "posture", label: "Posture" },
  { id: "squat", label: "Squat" },
  { id: "lunge", label: "Lunge" },
  { id: "pushup", label: "Push-up" },
  { id: "plank", label: "Plank" },
  { id: "bicep_curl", label: "Bicep Curl" },
];

export default function PostureCoach() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const detectorRef = useRef(null);
  const [exercise, setExercise] = useState("squat");
  const [isRunning, setIsRunning] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [lastError, setLastError] = useState(null);

  // Load pose detector once, ensuring TF backend is ready
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        // Force a known backend to avoid webgpu init issues
        await tf.setBackend("webgl");
        await tf.ready();

        const detector = await poseDetection.createDetector(
          poseDetection.SupportedModels.MoveNet,
          { modelType: "SinglePose.Lightning" }
        );

        if (!cancelled) detectorRef.current = detector;
      } catch (e) {
        console.error("Failed to load pose detector", e);
        setLastError(
          "Failed to load pose detector. Check browser support or try refreshing the page."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const drawSkeleton = useCallback((pose, ctx, width, height) => {
    if (!pose || !pose.keypoints) return;
    const keypoints = pose.keypoints.filter((k) => k.score > 0.4);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#22c55e";
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 3;

    keypoints.forEach((kp) => {
      ctx.beginPath();
      ctx.arc(kp.x, kp.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    const adjacentPairs = poseDetection.util.getAdjacentPairs(
      poseDetection.SupportedModels.MoveNet
    );
    adjacentPairs.forEach(([i, j]) => {
      const kp1 = pose.keypoints[i];
      const kp2 = pose.keypoints[j];
      if (kp1.score > 0.4 && kp2.score > 0.4) {
        ctx.beginPath();
        ctx.moveTo(kp1.x, kp1.y);
        ctx.lineTo(kp2.x, kp2.y);
        ctx.stroke();
      }
    });
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
        drawSkeleton(pose, ctx, videoWidth, videoHeight);

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
              if (res?.success) setAnalysis(res.analysis);
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
    setIsRunning((prev) => !prev);
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
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  isRunning
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-emerald-500 text-gray-900 hover:bg-emerald-400"
                }`}
              >
                {isRunning ? "Stop Coaching" : "Start Coaching"}
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
              {!isRunning && (
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


