/** Plausible input ranges for adult-oriented BMI (metric weight, ft/in height). */
export const BMI_LIMITS = {
  feetMin: 3,
  feetMax: 8,
  inchesMin: 0,
  inchesMax: 11,
  /** Total height ~107 cm – 244 cm */
  totalInchesMin: 42,
  totalInchesMax: 96,
  weightKgMin: 15,
  weightKgMax: 350,
  ageMin: 13,
  ageMax: 120,
};

/**
 * Validates height, weight (kg), and age. Returns field-level errors for inline UI.
 * @param {{ heightFeet: string|number, heightInches: string|number, weight: string|number, age: string|number }} formData
 */
export function validateBmiForm(formData) {
  const errors = {};

  const feetRaw = (formData.heightFeet ?? "").toString().trim();
  const inchesRaw = (formData.heightInches ?? "").toString().trim();
  const weightRaw = (formData.weight ?? "").toString().trim().replace(",", ".");
  const ageRaw = (formData.age ?? "").toString().trim();

  if (!feetRaw) {
    errors.heightFeet = "Feet are required.";
  } else if (!/^\d+$/.test(feetRaw)) {
    errors.heightFeet = "Use a whole number for feet (no decimals).";
  } else {
    const f = parseInt(feetRaw, 10);
    if (f < BMI_LIMITS.feetMin || f > BMI_LIMITS.feetMax) {
      errors.heightFeet = `Feet must be between ${BMI_LIMITS.feetMin} and ${BMI_LIMITS.feetMax}.`;
    }
  }

  if (inchesRaw === "") {
    errors.heightInches = "Inches are required (enter 0 if none).";
  } else if (!/^\d+$/.test(inchesRaw)) {
    errors.heightInches = "Use a whole number for inches (0–11).";
  } else {
    const inch = parseInt(inchesRaw, 10);
    if (inch < BMI_LIMITS.inchesMin || inch > BMI_LIMITS.inchesMax) {
      errors.heightInches = `Inches must be between ${BMI_LIMITS.inchesMin} and ${BMI_LIMITS.inchesMax}.`;
    }
  }

  if (!errors.heightFeet && !errors.heightInches) {
    const f = parseInt(feetRaw, 10);
    const inch = parseInt(inchesRaw, 10);
    const total = f * 12 + inch;
    if (total < BMI_LIMITS.totalInchesMin) {
      errors.height =
        "That height is too short for a reliable result. Please check feet and inches.";
    } else if (total > BMI_LIMITS.totalInchesMax) {
      errors.height =
        "That height is too tall. Please check feet and inches (max 8 ft).";
    }
  }

  if (!weightRaw) {
    errors.weight = "Weight in kilograms is required.";
  } else {
    const w = parseFloat(weightRaw);
    if (!Number.isFinite(w)) {
      errors.weight = "Enter a valid weight number.";
    } else if (w <= 0) {
      errors.weight = "Weight must be greater than zero.";
    } else if (w < BMI_LIMITS.weightKgMin) {
      errors.weight = `Weight must be at least ${BMI_LIMITS.weightKgMin} kg.`;
    } else if (w > BMI_LIMITS.weightKgMax) {
      errors.weight = `Weight must be at most ${BMI_LIMITS.weightKgMax} kg.`;
    } else {
      const dec = weightRaw.split(".")[1];
      if (dec && dec.length > 2) {
        errors.weight = "Use at most two decimal places (e.g. 72.5).";
      }
    }
  }

  if (!ageRaw) {
    errors.age = "Age is required.";
  } else if (!/^\d+$/.test(ageRaw)) {
    errors.age = "Age must be a whole number.";
  } else {
    const a = parseInt(ageRaw, 10);
    if (a < BMI_LIMITS.ageMin) {
      errors.age = `Minimum age is ${BMI_LIMITS.ageMin} years.`;
    } else if (a > BMI_LIMITS.ageMax) {
      errors.age = `Please enter a realistic age (max ${BMI_LIMITS.ageMax}).`;
    }
  }

  const firstMessage =
    errors.heightFeet ||
    errors.heightInches ||
    errors.height ||
    errors.weight ||
    errors.age ||
    null;

  return { ok: Object.keys(errors).length === 0, errors, firstMessage };
}

export function bmiCategoryFromValue(bmiNum) {
  if (bmiNum < 18.5) return "Underweight";
  if (bmiNum < 24.9) return "Normal weight";
  if (bmiNum < 29.9) return "Overweight";
  if (bmiNum < 35) return "Obese";
  return "Morbid obesity";
}

/** Height in meters from feet + inches (consistent with total inches × 0.0254). */
export function heightMetersFromFtIn(feet, inches) {
  const totalInches = parseInt(feet, 10) * 12 + parseInt(inches, 10);
  return totalInches * 0.0254;
}
