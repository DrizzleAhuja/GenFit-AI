import React, { useState, useEffect } from 'react';

const StepCounter = () => {
  const [steps, setSteps] = useState(0);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);

  // Load steps from local storage on mount
  useEffect(() => {
    const savedSteps = localStorage.getItem('genfit_daily_steps');
    if (savedSteps) setSteps(parseInt(savedSteps));
  }, []);

  // Save steps to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('genfit_daily_steps', steps.toString());
  }, [steps]);

  const startTracking = async () => {
    // Check if DeviceMotionEvent is available
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permission = await DeviceMotionEvent.requestPermission();
        if (permission === 'granted') {
          initSensor();
        } else {
          setError("Permission denied. GenFit AI needs motion access to count steps.");
        }
      } catch (err) {
        setError("Error requesting permission.");
      }
    } else {
      // For non-iOS or older browsers
      initSensor();
    }
  };

  const initSensor = () => {
    setIsTracking(true);
    let lastAcceleration = { x: 0, y: 0, z: 0 };
    let shakeThreshold = 12; // Adjust this for sensitivity (higher = harder to trigger)

    const handleMotion = (event) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;

      const deltaX = Math.abs(acc.x - lastAcceleration.x);
      const deltaY = Math.abs(acc.y - lastAcceleration.y);
      const deltaZ = Math.abs(acc.z - lastAcceleration.z);

      // Simple logic: If change in movement is above threshold, count as a step
      if ((deltaX + deltaY + deltaZ) > shakeThreshold) {
        setSteps((prev) => prev + 1);
      }

      lastAcceleration = { x: acc.x, y: acc.y, z: acc.z };
    };

    window.addEventListener('devicemotion', handleMotion);
    
    // Cleanup on stop
    return () => window.removeEventListener('devicemotion', handleMotion);
  };

  const resetSteps = () => {
    if (window.confirm("Are you sure you want to reset today's steps?")) {
      setSteps(0);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>GenFit AI Step Tracker</h2>
      
      <div style={styles.counterCircle}>
        <span style={styles.stepCount}>{steps}</span>
        <p style={styles.label}>STEPS</p>
      </div>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.buttonGroup}>
        {!isTracking ? (
          <button onClick={startTracking} style={styles.buttonStart}>Start Tracking</button>
        ) : (
          <button disabled style={styles.buttonActive}>Tracking Active...</button>
        )}
        <button onClick={resetSteps} style={styles.buttonReset}>Reset</button>
      </div>

      <p style={styles.note}>
        Keep your phone in your hand or pocket while walking.
      </p>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    textAlign: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: '20px',
    color: '#fff',
    maxWidth: '350px',
    margin: '20px auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
    fontFamily: 'Arial, sans-serif'
  },
  title: { color: '#00d4ff', marginBottom: '20px' },
  counterCircle: {
    width: '180px',
    height: '180px',
    borderRadius: '50%',
    border: '8px solid #00d4ff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '0 auto 20px',
    backgroundColor: '#252525'
  },
  stepCount: { fontSize: '48px', fontWeight: 'bold', margin: 0 },
  label: { margin: 0, letterSpacing: '2px', color: '#aaa' },
  buttonGroup: { display: 'flex', gap: '10px', justifyContent: 'center' },
  buttonStart: { backgroundColor: '#00d4ff', color: '#000', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  buttonActive: { backgroundColor: '#333', color: '#888', border: 'none', padding: '10px 20px', borderRadius: '10px' },
  buttonReset: { backgroundColor: 'transparent', color: '#ff4d4d', border: '1px solid #ff4d4d', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' },
  error: { color: '#ff4d4d', fontSize: '12px', marginTop: '10px' },
  note: { fontSize: '12px', color: '#666', marginTop: '15px' }
};

export default StepCounter;