/** Shared client-side limits and helpers to keep forms consistent across the app. */

export const LIMITS = {
  CONTACT_NAME_MAX: 120,
  CONTACT_MESSAGE_MIN: 10,
  CONTACT_MESSAGE_MAX: 5000,
  CONTACT_SUBJECT_MAX: 200,
  CONTACT_ROLL_MAX: 50,
  CONTACT_ITEM_MAX: 200,
  CONTACT_DESC_MIN: 10,
  CONTACT_DESC_MAX: 5000,
  CONTACT_REPORT_ID_MAX: 80,
  SUPPORT_DESC_MIN: 15,
  SUPPORT_DESC_MAX: 8000,
  FEEDBACK_MSG_MIN: 10,
  FEEDBACK_MSG_MAX: 8000,
  FEEDBACK_TOPIC_MAX: 120,
  COMMUNITY_POST_MAX: 5000,
  COMMUNITY_COMMENT_MAX: 2000,
  PROFILE_NAME_MIN: 1,
  PROFILE_NAME_MAX: 80,
  PROFILE_HEALTH_TEXT_MAX: 2000,
  WEIGHT_MIN_KG: 30,
  WEIGHT_MAX_KG: 350,
  MEAL_TEXT_MAX: 2000,
  FITBOT_MESSAGE_MAX: 4000,
  OTP_LENGTH: 6,
  CALORIE_QTY_MIN: 0.01,
  CALORIE_QTY_MAX: 10000,
  CALORIE_ITEM_NAME_MAX: 500,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
  if (email == null || typeof email !== "string") return false;
  const s = email.trim();
  if (s.length < 3 || s.length > 254) return false;
  return EMAIL_RE.test(s);
}

export function validateLength(value, min, max, fieldLabel) {
  const t = (value ?? "").trim();
  const len = t.length;
  if (len < min) return `${fieldLabel} must be at least ${min} characters.`;
  if (len > max) return `${fieldLabel} must be at most ${max} characters.`;
  return null;
}

/**
 * @param {string} goal
 * @param {string|number} currentWeightStr
 * @param {string|number} targetWeightStr
 * @returns {string|null} error message or null if valid
 */
export function validateWorkoutWeights(goal, currentWeightStr, targetWeightStr) {
  const cw = parseFloat(String(currentWeightStr ?? "").replace(",", "."));
  if (!Number.isFinite(cw) || cw < LIMITS.WEIGHT_MIN_KG || cw > LIMITS.WEIGHT_MAX_KG) {
    return "Current weight must be a number between 30 and 350 kg.";
  }
  if (goal === "lose_weight" || goal === "gain_weight") {
    const tw = parseFloat(String(targetWeightStr ?? "").replace(",", "."));
    if (!Number.isFinite(tw) || tw < LIMITS.WEIGHT_MIN_KG || tw > LIMITS.WEIGHT_MAX_KG) {
      return "Target weight must be a number between 30 and 350 kg.";
    }
    if (goal === "lose_weight" && tw >= cw) {
      return "For weight loss, target weight must be below your current weight.";
    }
    if (goal === "gain_weight" && tw <= cw) {
      return "For weight gain, target weight must be above your current weight.";
    }
  }
  return null;
}

export function isValidOtpDigits(otp) {
  const s = String(otp ?? "").trim();
  return new RegExp(`^\\d{${LIMITS.OTP_LENGTH}}$`).test(s);
}
