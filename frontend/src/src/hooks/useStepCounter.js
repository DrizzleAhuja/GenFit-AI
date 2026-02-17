import { useEffect, useRef, useState } from "react";

const DAILY_TARGET_DEFAULT = 10000;
const STORAGE_KEY = "genfit_step_counter";

/**
 * Simple client-side step counter using DeviceMotion.
 * - Approximates steps from acceleration peaks.
 * - Stores daily steps in localStorage (resets each day).
 */
export function useStepCounter() {
  const [steps, setSteps] = useState(0);
  const [target] = useState(DAILY_TARGET_DEFAULT);
  const [permissionState, setPermissionState] = useState("idle"); // idle | granted | denied | unsupported

  const lastStepTimeRef = useRef(0);
  const motionHandlerRef = useRef(null);
  const stepPhaseRef = useRef("idle"); // idle | up

  // Load stored steps for today
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const today = new Date().toISOString().slice(0, 10);
      if (parsed.date === today && typeof parsed.steps === "number") {
        setSteps(parsed.steps);
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  // Persist steps when they change
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ date: today, steps })
      );
    } catch {
      // ignore storage errors
    }
  }, [steps]);

  const attachListener = () => {
    if (motionHandlerRef.current) return;

    const handler = (event) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (!acc) return;

      const ax = acc.x || 0;
      const ay = acc.y || 0;
      const az = acc.z || 0;

      // Overall magnitude including gravity (should be near ~9.8 at rest)
      const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
      const now = Date.now();

      // Heuristic: only consider reasonable walking/jogging magnitudes
      if (magnitude < 8 || magnitude > 20) {
        // ignore extreme noise (e.g., phone being thrown/rotated wildly)
        return;
      }

      // Use vertical-like axis (ay is a decent proxy when phone is upright / in pocket)
      const vertical = ay;

      // Step detection using a small state machine on vertical acceleration:
      // - When vertical goes clearly above GRAVITY + THRESH_UP, mark "up" phase
      // - When it comes back down below GRAVITY - THRESH_DOWN, count a step
      // This reduces false positives from just shaking the phone up/down quickly.
      const GRAVITY = 9.8;
      const THRESH_UP = 3.0;    // need a stronger "up" peak
      const THRESH_DOWN = 2.0;  // and then a clear release
      const MIN_STEP_INTERVAL_MS = 450; // min time between steps

      const phase = stepPhaseRef.current;
      const timeSinceLast = now - lastStepTimeRef.current;

      if (phase === "idle") {
        if (
          vertical > GRAVITY + THRESH_UP &&
          timeSinceLast > MIN_STEP_INTERVAL_MS
        ) {
          stepPhaseRef.current = "up";
        }
      } else if (phase === "up") {
        if (vertical < GRAVITY - THRESH_DOWN) {
          // Completed an up-down cycle -> likely one step
          lastStepTimeRef.current = now;
          stepPhaseRef.current = "idle";
          setSteps((prev) => prev + 1);
        }
      }
    };

    motionHandlerRef.current = handler;
    window.addEventListener("devicemotion", handler);
  };

  const detachListener = () => {
    if (motionHandlerRef.current) {
      window.removeEventListener("devicemotion", motionHandlerRef.current);
      motionHandlerRef.current = null;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      detachListener();
    };
  }, []);

  const startTracking = async () => {
    // Check basic support
    if (typeof window === "undefined" || typeof window.addEventListener === "undefined") {
      setPermissionState("unsupported");
      return;
    }

    try {
      // iOS 13+ requires explicit permission
      if (
        typeof DeviceMotionEvent !== "undefined" &&
        typeof DeviceMotionEvent.requestPermission === "function"
      ) {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== "granted") {
          setPermissionState("denied");
          return;
        }
      }

      setPermissionState("granted");
      attachListener();
    } catch (e) {
      console.error("Step tracking permission error:", e);
      setPermissionState("denied");
    }
  };

  return {
    steps,
    target,
    permissionState,
    startTracking,
  };
}

