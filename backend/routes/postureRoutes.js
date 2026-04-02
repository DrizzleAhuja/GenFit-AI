const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PostureSessionLog = require("../models/PostureSessionLog").default;
const { checkAndIncrementLimit } = require("../utils/limitCheck");

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

/**
 * Helper: try left/right side and average angles when both are available.
 */
function averageSideAngle(landmarks, namesPerSide) {
  const left = {};
  const right = {};

  Object.keys(namesPerSide).forEach((key) => {
    const base = namesPerSide[key];
    left[key] = getPoint(landmarks, `left_${base}`);
    right[key] = getPoint(landmarks, `right_${base}`);
  });

  const leftAngle =
    left.a && left.b && left.c ? angleBetween(left.a, left.b, left.c) : null;
  const rightAngle =
    right.a && right.b && right.c ? angleBetween(right.a, right.b, right.c) : null;

  if (leftAngle && rightAngle) return (leftAngle + rightAngle) / 2;
  return leftAngle || rightAngle || null;
}

// Centralized thresholds for all exercises available in PostureCoach
const EXERCISE_ANALYSIS_THRESHOLDS = {
  squat: { minKneeAngle: 60, maxKneeAngle: 130, idealKneeAngle: 100 },
  pushup: {
    minBodyLine: 150,
    maxElbowBottom: 160,
    minElbowBottom: 70,
    idealBodyLine: 100,
    idealElbowShifted: 100,
  },
  bicep_curl: { minElbowAngle: 40, maxElbowAngle: 160, idealElbowAngle: 80 },
  lunge: { minKneeAngle: 60, maxKneeAngle: 140, idealKneeAngle: 90 },
  plank: { minBodyAngle: 165, maxBodyAngle: 185, idealBodyAngle: 180 },
  shoulder_press: { minElbowTop: 70, maxElbowBottom: 150, idealElbowAngle: 100 },
  lateral_raise: { minTorsoArm: 60, maxTorsoArm: 120, idealTorsoArm: 90 },
  deadlift: { minHipAngle: 60, maxHipAngle: 150, idealHipAngle: 120 },
  bent_over_row: { maxTorsoAngle: 140, maxRowAngle: 160, idealTorsoAngle: 110, idealRowShifted: 100 },
  tricep_extension: { minElbowAngle: 40, maxElbowAngle: 170, idealElbowAngle: 80 },
  side_plank: { minBodyAngle: 165, maxBodyAngle: 195, idealBodyAngle: 180 },
  high_knees: { maxKneeAngle: 140, idealKneeAngle: 90 },
  jumping_jack: { minLegRatio: 1.2, minArmRatio: 1.2, idealLegRatio: 1.5, idealArmRatio: 1.5 },
  mountain_climber: { minBodyAngle: 150, maxKneeAngle: 140, idealBodyAngle: 170, idealKneeAngle: 90 },
  posture: {
    minBodyAngle: 165,
    maxBodyAngle: 195,
    minNeckAngle: 150,
    maxNeckAngle: 210,
    shoulderDeltaMax: 30,
    minKneeOverAnkle: 160,
    maxKneeOverAnkle: 200,
    idealBodyAngle: 180,
    idealNeckAngle: 180,
    idealKneeOverAnkle: 180,
  },
};

function analyzeSquat(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.squat;
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
    if (kneeAngle < t.minKneeAngle) {
      issues.push("You are squatting too deep – stop before your knees go below ~60°.");
      isCorrect = false;
    } else if (kneeAngle > t.maxKneeAngle) {
      issues.push("Go a bit lower – bend your knees more to engage quads and glutes.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "squat",
    isCorrect,
    score: kneeAngle == null ? 0 : Math.max(0, Math.min(100, 140 - Math.abs(t.idealKneeAngle - kneeAngle))),
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
  const t = EXERCISE_ANALYSIS_THRESHOLDS.pushup;
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
    if (bodyLine < t.minBodyLine) {
      issues.push("Keep your body in a straight line – avoid sagging hips.");
      isCorrect = false;
    }
    if (elbowAngle > t.maxElbowBottom) {
      issues.push("Lower yourself more – bend your elbows to around 90° at the bottom.");
      isCorrect = false;
    }
    if (elbowAngle < t.minElbowBottom) {
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
                Math.abs(t.idealBodyLine - bodyLine) / 2 -
                Math.abs(t.idealElbowShifted - (elbowAngle + 40)) / 2
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
  const t = EXERCISE_ANALYSIS_THRESHOLDS.bicep_curl;
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
    if (elbowAngle > t.maxElbowAngle) {
      issues.push("Arms are almost straight – curl up more to contract the biceps.");
      isCorrect = false;
    }
    if (elbowAngle < t.minElbowAngle) {
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
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealElbowAngle - elbowAngle) * 1.5)),
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
  const t = EXERCISE_ANALYSIS_THRESHOLDS.lunge;
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
    if (kneeAngle > t.maxKneeAngle) {
      issues.push("Bend your front knee more; aim for roughly 90° at the bottom.");
      isCorrect = false;
    }
    if (kneeAngle < t.minKneeAngle) {
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
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealKneeAngle - kneeAngle) * 2)),
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
  const t = EXERCISE_ANALYSIS_THRESHOLDS.plank;
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
    if (bodyAngle < t.minBodyAngle) {
      issues.push("Lift your hips slightly to form a straight line from shoulders to heels.");
      isCorrect = false;
    }
    if (bodyAngle > t.maxBodyAngle) {
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
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealBodyAngle - bodyAngle) * 2)),
    metrics: { bodyAngle },
    issues,
    tips: [
      "Keep shoulders stacked over elbows or wrists.",
      "Squeeze glutes and brace your core.",
      "Keep head in line with your spine, not dropping down.",
    ],
  };
}

/**
 * Shoulder press – focus on vertical pressing path and elbow extension.
 */
function analyzeShoulderPress(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.shoulder_press;
  const shoulderElbowWristAngle = averageSideAngle(landmarks, {
    a: "shoulder",
    b: "elbow",
    c: "wrist",
  });

  const issues = [];
  let isCorrect = true;

  if (shoulderElbowWristAngle == null) {
    issues.push(
      "Make sure at least one full arm (shoulder–elbow–wrist) is clearly visible while pressing overhead."
    );
    isCorrect = false;
  } else {
    if (shoulderElbowWristAngle < t.minElbowTop) {
      issues.push("Press the weight higher – fully extend your elbows at the top.");
      isCorrect = false;
    }
    if (shoulderElbowWristAngle > t.maxElbowBottom) {
      issues.push("Lower the weight under control – don't lock out aggressively.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "shoulder_press",
    isCorrect,
    score:
      shoulderElbowWristAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealElbowAngle - shoulderElbowWristAngle) * 1.2)),
    metrics: { shoulderElbowWristAngle },
    issues,
    tips: [
      "Keep your core braced and avoid leaning back.",
      "Press the weight in a slight arc so it finishes above mid‑foot.",
      "Keep wrists stacked over elbows throughout the press.",
    ],
  };
}

/**
 * Lateral raise – arm should move roughly out to the side to shoulder height.
 */
function analyzeLateralRaise(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.lateral_raise;
  const shoulder = getPoint(landmarks, "left_shoulder") || getPoint(landmarks, "right_shoulder");
  const elbow = getPoint(landmarks, "left_elbow") || getPoint(landmarks, "right_elbow");
  const wrist = getPoint(landmarks, "left_wrist") || getPoint(landmarks, "right_wrist");
  const hip = getPoint(landmarks, "left_hip") || getPoint(landmarks, "right_hip");

  const armAngle = shoulder && elbow && wrist ? angleBetween(shoulder, elbow, wrist) : null;
  const torsoArmAngle = shoulder && hip && wrist ? angleBetween(hip, shoulder, wrist) : null;

  const issues = [];
  let isCorrect = true;

  if (armAngle == null || torsoArmAngle == null) {
    issues.push(
      "Stand side‑on with one full arm and your torso clearly visible for lateral raise analysis."
    );
    isCorrect = false;
  } else {
    if (torsoArmAngle < t.minTorsoArm) {
      issues.push("Raise your arms higher – aim for shoulder height.");
      isCorrect = false;
    }
    if (torsoArmAngle > t.maxTorsoArm) {
      issues.push("Avoid swinging the arms too high; stop around shoulder height.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "lateral_raise",
    isCorrect,
    score:
      torsoArmAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealTorsoArm - torsoArmAngle) * 2)),
    metrics: { armAngle, torsoArmAngle },
    issues,
    tips: [
      "Keep a slight bend in the elbows; don't lock them.",
      "Lift out to the side, not forward.",
      "Lead with the elbows and keep shoulders away from your ears.",
    ],
  };
}

/**
 * Deadlift – hip hinge with neutral back.
 */
function analyzeDeadlift(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.deadlift;
  const leftShoulder = getPoint(landmarks, "left_shoulder");
  const rightShoulder = getPoint(landmarks, "right_shoulder");
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");
  const leftKnee = getPoint(landmarks, "left_knee");
  const rightKnee = getPoint(landmarks, "right_knee");

  const shoulder = leftShoulder || rightShoulder;
  const hip = leftHip || rightHip;
  const knee = leftKnee || rightKnee;

  const hipAngle = shoulder && hip && knee ? angleBetween(shoulder, hip, knee) : null;

  const issues = [];
  let isCorrect = true;

  if (hipAngle == null) {
    issues.push(
      "Make sure your full side profile from shoulders to knees is visible for deadlift analysis."
    );
    isCorrect = false;
  } else {
    if (hipAngle < t.minHipAngle) {
      issues.push("Don't collapse into the bottom – keep some bend at the hips, not just the knees.");
      isCorrect = false;
    }
    if (hipAngle > t.maxHipAngle) {
      issues.push("Push your hips back more to initiate the deadlift with a hinge, not just a squat.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "deadlift",
    isCorrect,
    score:
      hipAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealHipAngle - hipAngle) * 1.5)),
    metrics: { hipAngle },
    issues,
    tips: [
      "Keep the bar (or hands) close to your legs as you hinge.",
      "Maintain a flat back with chest proud.",
      "Drive through your heels and squeeze glutes at the top.",
    ],
  };
}

/**
 * Bent‑over row – hinge plus arm pull.
 */
function analyzeBentOverRow(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.bent_over_row;
  const shoulder = getPoint(landmarks, "left_shoulder") || getPoint(landmarks, "right_shoulder");
  const hip = getPoint(landmarks, "left_hip") || getPoint(landmarks, "right_hip");
  const knee = getPoint(landmarks, "left_knee") || getPoint(landmarks, "right_knee");
  const elbow = getPoint(landmarks, "left_elbow") || getPoint(landmarks, "right_elbow");
  const wrist = getPoint(landmarks, "left_wrist") || getPoint(landmarks, "right_wrist");

  const torsoAngle = shoulder && hip && knee ? angleBetween(shoulder, hip, knee) : null;
  const rowAngle = shoulder && elbow && wrist ? angleBetween(shoulder, elbow, wrist) : null;

  const issues = [];
  let isCorrect = true;

  if (torsoAngle == null || rowAngle == null) {
    issues.push(
      "Stand side‑on so your torso and working arm are visible from shoulder to wrist."
    );
    isCorrect = false;
  } else {
    if (torsoAngle > t.maxTorsoAngle) {
      issues.push("Hinge more at the hips – your torso should lean forward for a good row position.");
      isCorrect = false;
    }
    if (rowAngle > t.maxRowAngle) {
      issues.push("Pull your elbow back further to fully engage the upper back.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "bent_over_row",
    isCorrect,
    score:
      torsoAngle == null || rowAngle == null
        ? 0
        : Math.max(
            0,
            Math.min(
              100,
              60 -
                Math.abs(t.idealTorsoAngle - torsoAngle) / 2 -
                Math.abs(t.idealRowShifted - (rowAngle + 20)) / 2
            )
          ),
    metrics: { torsoAngle, rowAngle },
    issues,
    tips: [
      "Keep your back flat and core tight during the hinge.",
      "Row by driving the elbow back, keeping it close to your side.",
      "Avoid shrugging shoulders up toward your ears.",
    ],
  };
}

/**
 * Tricep extension – elbow as the pivot, upper arm stable.
 */
function analyzeTricepExtension(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.tricep_extension;
  const shoulder = getPoint(landmarks, "left_shoulder") || getPoint(landmarks, "right_shoulder");
  const elbow = getPoint(landmarks, "left_elbow") || getPoint(landmarks, "right_elbow");
  const wrist = getPoint(landmarks, "left_wrist") || getPoint(landmarks, "right_wrist");

  const elbowAngle = shoulder && elbow && wrist ? angleBetween(shoulder, elbow, wrist) : null;

  const issues = [];
  let isCorrect = true;

  if (elbowAngle == null) {
    issues.push("Make sure your upper arm and forearm are visible for tricep extension.");
    isCorrect = false;
  } else {
    if (elbowAngle > t.maxElbowAngle) {
      issues.push("Avoid hyper‑extending the elbows; stop just short of full lockout.");
      isCorrect = false;
    }
    if (elbowAngle < t.minElbowAngle) {
      issues.push("Don't let the elbows collapse too much; keep control at the bottom.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "tricep_extension",
    isCorrect,
    score:
      elbowAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealElbowAngle - elbowAngle) * 1.5)),
    metrics: { elbowAngle },
    issues,
    tips: [
      "Keep upper arms fixed; move only at the elbow.",
      "Brace your core to avoid swinging your torso.",
      "Use a full but controlled range of motion.",
    ],
  };
}

/**
 * Side plank – body in a straight line sideways.
 */
function analyzeSidePlank(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.side_plank;
  const shoulder = getPoint(landmarks, "left_shoulder") || getPoint(landmarks, "right_shoulder");
  const hip = getPoint(landmarks, "left_hip") || getPoint(landmarks, "right_hip");
  const ankle =
    getPoint(landmarks, "left_ankle") ||
    getPoint(landmarks, "right_ankle") ||
    getPoint(landmarks, "left_knee") ||
    getPoint(landmarks, "right_knee");

  const bodyAngle = shoulder && hip && ankle ? angleBetween(shoulder, hip, ankle) : null;

  const issues = [];
  let isCorrect = true;

  if (bodyAngle == null) {
    issues.push(
      "For side plank, keep your entire side body visible from shoulder to feet or knees."
    );
    isCorrect = false;
  } else {
    if (bodyAngle < t.minBodyAngle) {
      issues.push("Lift your hips so your body forms a straight line from shoulder to ankle.");
      isCorrect = false;
    }
    if (bodyAngle > t.maxBodyAngle) {
      issues.push("Avoid piking hips up too high; stay in a straight line.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "side_plank",
    isCorrect,
    score:
      bodyAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealBodyAngle - bodyAngle) * 2)),
    metrics: { bodyAngle },
    issues,
    tips: [
      "Stack your shoulders and hips vertically.",
      "Keep your neck neutral; look straight ahead.",
      "Squeeze glutes and brace your obliques.",
    ],
  };
}

/**
 * High knees – focus on knee lift.
 */
function analyzeHighKnees(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.high_knees;
  const hip = getPoint(landmarks, "left_hip") || getPoint(landmarks, "right_hip");
  const knee = getPoint(landmarks, "left_knee") || getPoint(landmarks, "right_knee");
  const ankle = getPoint(landmarks, "left_ankle") || getPoint(landmarks, "right_ankle");

  const kneeAngle = hip && knee && ankle ? angleBetween(hip, knee, ankle) : null;

  const issues = [];
  let isCorrect = true;

  if (kneeAngle == null) {
    issues.push("Move back so at least one full leg is visible from hip to ankle.");
    isCorrect = false;
  } else {
    if (kneeAngle > t.maxKneeAngle) {
      issues.push("Drive your knee higher toward hip level.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "high_knees",
    isCorrect,
    score:
      kneeAngle == null
        ? 0
        : Math.max(0, Math.min(100, 120 - Math.abs(t.idealKneeAngle - kneeAngle) * 2)),
    metrics: { kneeAngle },
    issues,
    tips: [
      "Stay tall; avoid leaning back excessively.",
      "Pump your arms in rhythm with your legs.",
      "Land softly on the balls of your feet.",
    ],
  };
}

/**
 * Jumping jack – arm and leg spread together.
 */
function analyzeJumpingJack(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.jumping_jack;
  const leftAnkle = getPoint(landmarks, "left_ankle");
  const rightAnkle = getPoint(landmarks, "right_ankle");
  const leftWrist = getPoint(landmarks, "left_wrist");
  const rightWrist = getPoint(landmarks, "right_wrist");
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");

  const legSpread =
    leftAnkle && rightAnkle ? Math.abs(leftAnkle.x - rightAnkle.x) : null;
  const armSpread =
    leftWrist && rightWrist ? Math.abs(leftWrist.x - rightWrist.x) : null;
  const hipWidth =
    leftHip && rightHip ? Math.abs(leftHip.x - rightHip.x) : null;

  const issues = [];
  let isCorrect = true;

  if (legSpread == null || armSpread == null || hipWidth == null) {
    issues.push(
      "Stand far enough from the camera so your full body is visible for jumping jacks."
    );
    isCorrect = false;
  } else {
    const legRatio = legSpread / hipWidth;
    const armRatio = armSpread / hipWidth;

    if (legRatio < t.minLegRatio) {
      issues.push("Jump your feet wider apart to increase leg range.");
      isCorrect = false;
    }
    if (armRatio < t.minArmRatio) {
      issues.push("Raise your arms higher overhead during each jack.");
      isCorrect = false;
    }
  }

  const scoreBase =
    legSpread == null || armSpread == null || hipWidth == null
      ? 0
      : Math.max(
          0,
          Math.min(
            100,
            60 -
              Math.abs(t.idealLegRatio - legSpread / hipWidth) * 30 -
              Math.abs(t.idealArmRatio - armSpread / hipWidth) * 30
          )
        );

  return {
    exerciseType: "jumping_jack",
    isCorrect,
    score: scoreBase,
    metrics: { legSpread, armSpread, hipWidth },
    issues,
    tips: [
      "Land softly and keep knees slightly bent.",
      "Maintain an upright torso instead of leaning forward.",
      "Coordinate arm and leg movements for smooth rhythm.",
    ],
  };
}

/**
 * Mountain climber – knee drive toward chest in plank.
 */
function analyzeMountainClimber(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.mountain_climber;
  const shoulder = getPoint(landmarks, "left_shoulder") || getPoint(landmarks, "right_shoulder");
  const hip = getPoint(landmarks, "left_hip") || getPoint(landmarks, "right_hip");
  const knee = getPoint(landmarks, "left_knee") || getPoint(landmarks, "right_knee");
  const ankle = getPoint(landmarks, "left_ankle") || getPoint(landmarks, "right_ankle");

  const bodyAngle = shoulder && hip && ankle ? angleBetween(shoulder, hip, ankle) : null;
  const kneeAngle = hip && knee && ankle ? angleBetween(hip, knee, ankle) : null;

  const issues = [];
  let isCorrect = true;

  if (bodyAngle == null || kneeAngle == null) {
    issues.push(
      "Start in a visible plank position so your shoulders, hips and at least one leg are clearly tracked."
    );
    isCorrect = false;
  } else {
    if (bodyAngle < t.minBodyAngle) {
      issues.push("Keep your body straighter – avoid letting hips sag.");
      isCorrect = false;
    }
    if (kneeAngle > t.maxKneeAngle) {
      issues.push("Drive your knee closer to your chest on each rep.");
      isCorrect = false;
    }
  }

  return {
    exerciseType: "mountain_climber",
    isCorrect,
    score:
      bodyAngle == null || kneeAngle == null
        ? 0
        : Math.max(
            0,
            Math.min(
              100,
              60 -
                Math.abs(t.idealBodyAngle - bodyAngle) / 2 -
                Math.abs(t.idealKneeAngle - kneeAngle) / 2
            )
          ),
    metrics: { bodyAngle, kneeAngle },
    issues,
    tips: [
      "Keep shoulders stacked over wrists.",
      "Maintain a steady breathing pattern instead of holding your breath.",
      "Move quickly but under control to protect your lower back.",
    ],
  };
}

function analyzeGeneralPosture(landmarks) {
  const t = EXERCISE_ANALYSIS_THRESHOLDS.posture;
  const leftShoulder = getPoint(landmarks, "left_shoulder");
  const rightShoulder = getPoint(landmarks, "right_shoulder");
  const leftHip = getPoint(landmarks, "left_hip");
  const rightHip = getPoint(landmarks, "right_hip");
  const leftAnkle = getPoint(landmarks, "left_ankle");
  const rightAnkle = getPoint(landmarks, "right_ankle");
  const nose = getPoint(landmarks, "nose");
  const leftEar = getPoint(landmarks, "left_ear");
  const rightEar = getPoint(landmarks, "right_ear");
  const leftKnee = getPoint(landmarks, "left_knee");
  const rightKnee = getPoint(landmarks, "right_knee");

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
  ); // hip is middle point for overall body line

  // Head/neck posture: angle between hip‑shoulder‑head (nose or ear)
  const headPoint = nose || leftEar || rightEar || midShoulder;
  const neckAngle =
    midHip && midShoulder && headPoint
      ? angleBetween(midHip, midShoulder, headPoint)
      : null;

  // Knee alignment: how much knees drift relative to ankles/hips (frontal plane proxy)
  const knee =
    leftKnee && rightKnee
      ? { x: (leftKnee.x + rightKnee.x) / 2, y: (leftKnee.y + rightKnee.y) / 2 }
      : leftKnee || rightKnee;
  const kneeOverAnkleAngle =
    knee && midAnkle && midHip ? angleBetween(midHip, knee, midAnkle) : null;

  const issues = [];
  let isCorrect = true;

  if (!midShoulder || !midHip || !midAnkle || bodyAngle == null) {
    issues.push(
      "Stand full body in view from head to feet for posture check (side-on works best)."
    );
    isCorrect = false;
  } else {
    if (bodyAngle < t.minBodyAngle) {
      issues.push(
        "You may be leaning forward or rounding your back. Stand tall with shoulders stacked over hips."
      );
      isCorrect = false;
    }
    if (bodyAngle > t.maxBodyAngle) {
      issues.push(
        "You may be arching your lower back. Gently tuck your pelvis and brace your core."
      );
      isCorrect = false;
    }
  }

  // Head/neck forward posture
  if (neckAngle != null && (neckAngle < t.minNeckAngle || neckAngle > t.maxNeckAngle)) {
    issues.push(
      "Bring your head back in line with your shoulders – avoid craning your neck forward."
    );
    isCorrect = false;
  }

  // Shoulder height symmetry (side tilt)
  if (leftShoulder && rightShoulder) {
    const shoulderDelta = Math.abs(leftShoulder.y - rightShoulder.y);
    if (shoulderDelta > t.shoulderDeltaMax) {
      issues.push("Try to keep both shoulders at the same height; avoid leaning to one side.");
      isCorrect = false;
    }
  }

  // Knee‑over‑ankle alignment
  if (kneeOverAnkleAngle != null && (kneeOverAnkleAngle < t.minKneeOverAnkle || kneeOverAnkleAngle > t.maxKneeOverAnkle)) {
    issues.push(
      "Distribute your weight evenly so knees track roughly above the ankles, not collapsing inward or pushing too far forward."
    );
    isCorrect = false;
  }

  return {
    exerciseType: "posture",
    isCorrect,
    score:
      bodyAngle == null
        ? 0
        : Math.max(
            0,
            Math.min(
              100,
              80 -
                Math.abs(t.idealBodyAngle - bodyAngle) * 1.2 -
                (neckAngle != null ? Math.abs(t.idealNeckAngle - neckAngle) * 0.6 : 0) -
                (kneeOverAnkleAngle != null ? Math.abs(t.idealKneeOverAnkle - kneeOverAnkleAngle) * 0.4 : 0)
            )
          ),
    metrics: { bodyAngle, neckAngle, kneeOverAnkleAngle },
    issues,
    tips: [
      "Imagine a string pulling the top of your head up toward the ceiling.",
      "Keep ears roughly over shoulders, shoulders over hips, hips over knees, and knees over ankles.",
      "Gently brace your core, soften the knees, and avoid locking joints.",
    ],
  };
}

router.post("/start-session", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ success: false, error: "userId is required" });
    }

    const { checkAndIncrementLimit } = require("../utils/limitCheck");
    const limitCheck = await checkAndIncrementLimit(userId, "vtaUsage");
    
    if (!limitCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: limitCheck.message || "Limit exceeded"
      });
    }

    res.json({ success: true, message: "Session started" });
  } catch (error) {
    console.error("VTA Start Session Error:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const { exerciseType, landmarks, userId } = req.body || {};

    if (!exerciseType || !Array.isArray(landmarks) || landmarks.length === 0) {
      return res.status(400).json({
        success: false,
        error: "exerciseType and landmarks[] are required",
      });
    }

    // Limits are now enforced on /start-session endpoint to count usage correctly.

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
      case "shoulder_press":
        result = analyzeShoulderPress(landmarks);
        break;
      case "lateral_raise":
        result = analyzeLateralRaise(landmarks);
        break;
      case "deadlift":
        result = analyzeDeadlift(landmarks);
        break;
      case "bent_over_row":
        result = analyzeBentOverRow(landmarks);
        break;
      case "tricep_extension":
        result = analyzeTricepExtension(landmarks);
        break;
      case "side_plank":
        result = analyzeSidePlank(landmarks);
        break;
      case "high_knees":
        result = analyzeHighKnees(landmarks);
        break;
      case "jumping_jack":
        result = analyzeJumpingJack(landmarks);
        break;
      case "mountain_climber":
        result = analyzeMountainClimber(landmarks);
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

// Log a virtual training (posture coach) session
router.post("/session-log", async (req, res) => {
  try {
    const {
      userId,
      exerciseType,
      reps,
      calories,
      durationSeconds,
      date,
    } = req.body || {};

    if (!exerciseType) {
      return res.status(400).json({
        success: false,
        error: "exerciseType is required",
      });
    }

    let user = null;
    if (userId) {
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }
    }

    const sessionDate = date ? new Date(date) : new Date();

    const session = new PostureSessionLog({
      userId: user ? user._id : undefined,
      exerciseType,
      reps: typeof reps === "number" ? reps : 0,
      calories: typeof calories === "number" ? calories : 0,
      durationSeconds:
        typeof durationSeconds === "number" ? durationSeconds : 0,
      date: sessionDate,
    });

    await session.save();

    return res.status(201).json({
      success: true,
      session,
    });
  } catch (err) {
    console.error("Posture session-log error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to log posture session",
    });
  }
});

// Get posture/virtual training sessions for last N days (default 15)
router.get("/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const days = parseInt(req.query.days, 10) || 15;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "userId is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const sessions = await PostureSessionLog.find({
      userId: userId,
      date: { $gte: cutoff },
    })
      .sort({ date: -1 })
      .limit(200);

    return res.json({
      success: true,
      sessions,
    });
  } catch (err) {
    console.error("Posture sessions fetch error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch posture sessions",
    });
  }
});

module.exports = router;


