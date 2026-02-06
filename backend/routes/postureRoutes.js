const express = require("express");
const router = express.Router();

/**
 * Utility: compute angle (in degrees) at point B between BA and BC.
 */
function angleBetween(a, b, c) {
  if (!a || !b || !c) return null;
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magAB = Math.hypot(ab.x, ab.y);
  const magCB = Math.hypot(cb.x, cb.y);
  if (!magAB || !magCB) return null;
  const cos = dot / (magAB * magCB);
  const clamped = Math.max(-1, Math.min(1, cos));
  return (Math.acos(clamped) * 180) / Math.PI;
}

/**
 * Extract landmark by name from an array of keypoints.
 * Frontend should send keypoints like: { name: 'left_knee', x, y, z?, visibility? }
 */
function getPoint(landmarks, name) {
  return landmarks.find((p) => p.name === name || p.part === name) || null;
}

function analyzeSquat(landmarks) {
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");
  const leftKnee = getPoint(landmarks, "left_knee");
  const rightKnee = getPoint(landmarks, "right_knee");
  const leftAnkle = getPoint(landmarks, "left_ankle");
  const rightAnkle = getPoint(landmarks, "right_ankle");

  const leftKneeAngle = angleBetween(leftHip, leftKnee, leftAnkle);
  const rightKneeAngle = angleBetween(rightHip, rightKnee, rightAnkle);

  const kneeAngle = leftKneeAngle && rightKneeAngle
    ? (leftKneeAngle + rightKneeAngle) / 2
    : leftKneeAngle || rightKneeAngle || null;

  const issues = [];
  let isCorrect = true;

  if (kneeAngle == null) {
    issues.push("Unable to see legs clearly – step back and ensure full body is in frame.");
    isCorrect = false;
  } else {
    if (kneeAngle < 60) {
      issues.push("You are squatting too deep – stop before your knees go below ~60°.");
      isCorrect = false;
    } else if (kneeAngle > 130) {
      issues.push("Go a bit lower – bend your knees more to engage quads and glutes.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "squat",
    isCorrect,
    score: kneeAngle == null ? 0 : Math.max(0, Math.min(100, 140 - Math.abs(100 - kneeAngle))),
    metrics: { kneeAngle },
    issues,
    tips: [
      "Keep your chest up and core tight.",
      "Push your hips back first, then bend the knees.",
      "Keep heels flat on the floor.",
    ],
  };
}

function analyzePushup(landmarks) {
  const leftShoulder = getPoint(landmarks, "left_shoulder");
  const rightShoulder = getPoint(landmarks, "right_shoulder");
  const leftElbow = getPoint(landmarks, "left_elbow");
  const rightElbow = getPoint(landmarks, "right_elbow");
  const leftWrist = getPoint(landmarks, "left_wrist");
  const rightWrist = getPoint(landmarks, "right_wrist");
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");

  const elbowAngleLeft = angleBetween(leftShoulder, leftElbow, leftWrist);
  const elbowAngleRight = angleBetween(rightShoulder, rightElbow, rightWrist);
  const elbowAngle = elbowAngleLeft && elbowAngleRight
    ? (elbowAngleLeft + elbowAngleRight) / 2
    : elbowAngleLeft || elbowAngleRight || null;

  const shoulderHipLeft = angleBetween(leftShoulder, leftHip, leftAnkleOrKnee(landmarks, "left"));
  const shoulderHipRight = angleBetween(rightShoulder, rightHip, leftAnkleOrKnee(landmarks, "right"));

  function leftAnkleOrKnee(list, side) {
    return getPoint(list, `${side}_ankle`) || getPoint(list, `${side}_knee`);
  }

  const bodyLine =
    shoulderHipLeft && shoulderHipRight
      ? (shoulderHipLeft + shoulderHipRight) / 2
      : shoulderHipLeft || shoulderHipRight || null;

  const issues = [];
  let isCorrect = true;

  if (elbowAngle == null || bodyLine == null) {
    issues.push("Move back so your whole body is visible from shoulders to feet.");
    isCorrect = false;
  } else {
    if (bodyLine < 150) {
      issues.push("Keep your body in a straight line – avoid sagging hips.");
      isCorrect = false;
    }
    if (elbowAngle > 160) {
      issues.push("Lower yourself more – bend your elbows to around 90° at the bottom.");
      isCorrect = false;
    }
    if (elbowAngle < 70) {
      issues.push("Don't go excessively deep – stop around 90° at the elbow.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "pushup",
    isCorrect,
    score:
      elbowAngle == null || bodyLine == null
        ? 0
        : Math.max(
            0,
            Math.min(
              100,
              50 -
                Math.abs(100 - bodyLine) / 2 -
                Math.abs(100 - (elbowAngle + 40)) / 2
            )
          ),
    metrics: { elbowAngle, bodyLineAngle: bodyLine },
    issues,
    tips: [
      "Hands slightly wider than shoulder width.",
      "Engage your core and glutes to keep a straight line.",
      "Lower under control; don't let your chest collapse.",
    ],
  };
}

function analyzeBicepCurl(landmarks) {
  const leftShoulder = getPoint(landmarks, "left_shoulder");
  const leftElbow = getPoint(landmarks, "left_elbow");
  const leftWrist = getPoint(landmarks, "left_wrist");

  const rightShoulder = getPoint(landmarks, "right_shoulder");
  const rightElbow = getPoint(landmarks, "right_elbow");
  const rightWrist = getPoint(landmarks, "right_wrist");

  const leftAngle = angleBetween(leftShoulder, leftElbow, leftWrist);
  const rightAngle = angleBetween(rightShoulder, rightElbow, rightWrist);
  const elbowAngle =
    leftAngle && rightAngle ? (leftAngle + rightAngle) / 2 : leftAngle || rightAngle || null;

  const issues = [];
  let isCorrect = true;

  if (elbowAngle == null) {
    issues.push("Ensure at least one full arm is clearly visible from shoulder to wrist.");
    isCorrect = false;
  } else {
    if (elbowAngle > 160) {
      issues.push("Arms are almost straight – curl up more to contract the biceps.");
      isCorrect = false;
    }
    if (elbowAngle < 40) {
      issues.push("Don't bring the dumbbells too high; stop slightly before your elbows fully close.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "bicep_curl",
    isCorrect,
    score:
      elbowAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(80 - elbowAngle) * 1.5)),
    metrics: { elbowAngle },
    issues,
    tips: [
      "Keep elbows pinned close to your sides.",
      "Avoid swinging your torso; move only at the elbow.",
      "Control both the up and down phases.",
    ],
  };
}

function analyzeLunge(landmarks) {
  const frontKnee =
    getPoint(landmarks, "left_knee") || getPoint(landmarks, "right_knee");
  const frontHip =
    getPoint(landmarks, "left_hip") || getPoint(landmarks, "right_hip");
  const frontAnkle =
    getPoint(landmarks, "left_ankle") || getPoint(landmarks, "right_ankle");

  const kneeAngle = angleBetween(frontHip, frontKnee, frontAnkle);

  const issues = [];
  let isCorrect = true;

  if (kneeAngle == null) {
    issues.push(
      "Make sure your front leg is fully visible from hip to ankle while lunging."
    );
    isCorrect = false;
  } else {
    if (kneeAngle > 140) {
      issues.push("Bend your front knee more; aim for roughly 90° at the bottom.");
      isCorrect = false;
    }
    if (kneeAngle < 60) {
      issues.push("Do not allow the front knee to collapse too much; keep it near 90°.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "lunge",
    isCorrect,
    score:
      kneeAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(90 - kneeAngle) * 2)),
    metrics: { kneeAngle },
    issues,
    tips: [
      "Keep your torso upright, not leaning forward too much.",
      "Front knee should stay stacked roughly above the ankle.",
      "Push back up through the front heel.",
    ],
  };
}

function analyzePlank(landmarks) {
  const leftShoulder = getPoint(landmarks, "left_shoulder");
  const rightShoulder = getPoint(landmarks, "right_shoulder");
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");
  const leftAnkle =
    getPoint(landmarks, "left_ankle") || getPoint(landmarks, "left_knee");
  const rightAnkle =
    getPoint(landmarks, "right_ankle") || getPoint(landmarks, "right_knee");

  const leftBody = angleBetween(leftShoulder, leftHip, leftAnkle);
  const rightBody = angleBetween(rightShoulder, rightHip, rightAnkle);
  const bodyAngle =
    leftBody && rightBody ? (leftBody + rightBody) / 2 : leftBody || rightBody || null;

  const issues = [];
  let isCorrect = true;

  if (bodyAngle == null) {
    issues.push(
      "Make sure your full body is visible from shoulders to feet while holding the plank."
    );
    isCorrect = false;
  } else {
    if (bodyAngle < 165) {
      issues.push("Lift your hips slightly to form a straight line from shoulders to heels.");
      isCorrect = false;
    }
    if (bodyAngle > 185) {
      issues.push("Lower your hips; avoid piking them up too high.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "plank",
    isCorrect,
    score:
      bodyAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(180 - bodyAngle) * 2)),
    metrics: { bodyAngle },
    issues,
    tips: [
      "Keep shoulders stacked over elbows or wrists.",
      "Squeeze glutes and brace your core.",
      "Keep head in line with your spine, not dropping down.",
    ],
  };
}

function analyzeGeneralPosture(landmarks) {
  const leftShoulder = getPoint(landmarks, "left_shoulder");
  const rightShoulder = getPoint(landmarks, "right_shoulder");
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");
  const leftAnkle = getPoint(landmarks, "left_ankle");
  const rightAnkle = getPoint(landmarks, "right_ankle");

  const midShoulder =
    leftShoulder && rightShoulder
      ? { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 }
      : leftShoulder || rightShoulder;
  const midHip =
    leftHip && rightHip
      ? { x: (leftHip.x + rightHip.x) / 2, y: (leftHip.y + rightHip.y) / 2 }
      : leftHip || rightHip;
  const midAnkle =
    leftAnkle && rightAnkle
      ? { x: (leftAnkle.x + rightAnkle.x) / 2, y: (leftAnkle.y + rightAnkle.y) / 2 }
      : leftAnkle || rightAnkle;

  // Angle of body line relative to vertical; ideal is near 180 (straight up)
  const bodyAngle = angleBetween(
    midAnkle,
    midHip,
    midShoulder
  ); // hip is middle point for angle at torso

  const issues = [];
  let isCorrect = true;

  if (!midShoulder || !midHip || !midAnkle || bodyAngle == null) {
    issues.push(
      "Stand full body in view from head to feet for posture check (side-on works best)."
    );
    isCorrect = false;
  } else {
    if (bodyAngle < 165) {
      issues.push(
        "You may be leaning forward or rounding your back. Stand tall with shoulders stacked over hips."
      );
      isCorrect = false;
    }
    if (bodyAngle > 195) {
      issues.push(
        "You may be arching your lower back. Gently tuck your pelvis and brace your core."
      );
      isCorrect = false;
    }
  }

  // Shoulder height symmetry (side tilt)
  if (leftShoulder && rightShoulder) {
    const shoulderDelta = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDelta > 30) {
      issues.push("Try to keep both shoulders at the same height; avoid leaning to one side.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "posture",
    isCorrect,
    score:
      bodyAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(180 - bodyAngle) * 2)),
    metrics: { bodyAngle },
    issues,
    tips: [
      "Imagine a string pulling the top of your head up toward the ceiling.",
      "Keep ears roughly over shoulders, shoulders over hips, and hips over ankles.",
      "Gently brace your core and avoid locking your knees.",
    ],
  };
}

router.post("/analyze", (req, res) => {
  try {
    const { exerciseType, landmarks } = req.body || {};

    if (!exerciseType || !Array.isArray(landmarks) || landmarks.length === 0) {
      return res.status(400).json({
        success: false,
        error: "exerciseType and landmarks[] are required",
      });
    }

    let result;
    switch (exerciseType) {
      case "squat":
        result = analyzeSquat(landmarks);
        break;
      case "pushup":
        result = analyzePushup(landmarks);
        break;
      case "bicep_curl":
        result = analyzeBicepCurl(landmarks);
        break;
      case "lunge":
        result = analyzeLunge(landmarks);
        break;
      case "plank":
        result = analyzePlank(landmarks);
        break;
      case "posture":
        result = analyzeGeneralPosture(landmarks);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: `Unsupported exerciseType: ${exerciseType}`,
        });
    }

    return res.json({
      success: true,
      analysis: result,
    });
  } catch (err) {
    console.error("Posture analysis error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to analyze posture",
    });
  }
});

module.exports = router;


