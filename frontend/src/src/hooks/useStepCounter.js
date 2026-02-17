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

  const lastMagnitudeRef = useRef(0);
  const lastStepTimeRef = useRef(0);
  const motionHandlerRef = useRef(null);

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

      const magnitude = Math.sqrt(ax * ax + ay * ay + az * az);
      const lastMag = lastMagnitudeRef.current;
      const now = Date.now();

      // Simple peak detection
      const diff = magnitude - lastMag;
      const STEP_THRESHOLD = 1.2;
      const MIN_STEP_INTERVAL_MS = 300;

      if (
        diff > STEP_THRESHOLD &&
        magnitude > 9.5 &&
        now - lastStepTimeRef.current > MIN_STEP_INTERVAL_MS
      ) {
        lastStepTimeRef.current = now;
        setSteps((prev) => prev + 1);
      }

      lastMagnitudeRef.current = magnitude;
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

