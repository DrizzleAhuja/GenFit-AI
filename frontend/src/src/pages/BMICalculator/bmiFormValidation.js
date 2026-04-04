/** Plausible ranges; weight is always validated in kg after conversion. */
export const BMI_LIMITS = {
  feetMin: 3,
  feetMax: 8,
  inchesMin: 0,
  inchesMax: 11,
  totalInchesMin: 42,
  totalInchesMax: 96,
  /** Same span as total inches 42–96 (≈ 3′6″–8′0″) */
  heightCmMin: 107,
  heightCmMax: 244,
  weightKgMin: 15,
  weightKgMax: 350,
  ageMin: 13,
  ageMax: 120,
};

/** Exact conversion factor (lb → kg). */
export const KG_PER_LB = 0.45359237;

export function lbToKg(lb) {
  return lb * KG_PER_LB;
}

export function kgToLb(kg) {
  return kg / KG_PER_LB;
}

export function heightMetersFromFtIn(feet, inches) {
  const totalInches = parseInt(feet, 10) * 12 + parseInt(inches, 10);
  return totalInches * 0.0254;
}

/** Centimeters → feet & inches for API storage (whole inches 0–11). */
export function cmToFtIn(cm) {
  if (!Number.isFinite(cm) || cm <= 0) return { feet: 0, inches: 0 };
  const totalIn = cm / 2.54;
  let feet = Math.floor(totalIn / 12);
  let inches = Math.round(totalIn - feet * 12);
  if (inches === 12) {
    feet += 1;
    inches = 0;
  }
  if (inches < 0) inches = 0;
  return { feet, inches };
}

export function ftInToCm(feet, inches) {
  return (parseInt(feet, 10) * 12 + parseInt(inches, 10)) * 2.54;
}

function decimalsTooLong(raw, maxDecimals) {
  const parts = String(raw).replace(",", ".").split(".");
  return parts[1] != null && parts[1].length > maxDecimals;
}

/**
 * @param {{
 *   heightUnit?: 'imperial' | 'metric',
 *   weightUnit?: 'kg' | 'lb',
 *   heightFeet?: string|number,
 *   heightInches?: string|number,
 *   heightCm?: string|number,
 *   weight?: string|number,
 *   age?: string|number,
 * }} formData
 */
export function validateBmiForm(formData) {
  const errors = {};
  const heightUnit = formData.heightUnit === "metric" ? "metric" : "imperial";
  const weightUnit = formData.weightUnit === "lb" ? "lb" : "kg";
  const ageRaw = (formData.age ?? "").toString().trim();
  const weightRaw = (formData.weight ?? "").toString().trim().replace(",", ".");

  if (heightUnit === "imperial") {
    const feetRaw = (formData.heightFeet ?? "").toString().trim();
    const inchesRaw = (formData.heightInches ?? "").toString().trim();

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
      const total =
        parseInt(feetRaw, 10) * 12 + parseInt(inchesRaw, 10);
      if (total < BMI_LIMITS.totalInchesMin) {
        errors.height =
          "That height is too short for a reliable result. Please check feet and inches.";
      } else if (total > BMI_LIMITS.totalInchesMax) {
        errors.height =
          "That height is too tall. Please check feet and inches (max 8 ft).";
      }
    }
  } else {
    const cmRaw = (formData.heightCm ?? "").toString().trim().replace(",", ".");
    if (!cmRaw) {
      errors.heightCm = "Height in centimeters is required.";
    } else {
      const cm = parseFloat(cmRaw);
      if (!Number.isFinite(cm)) {
        errors.heightCm = "Enter a valid height in cm.";
      } else if (cm <= 0) {
        errors.heightCm = "Height must be greater than zero.";
      } else if (cm < BMI_LIMITS.heightCmMin || cm > BMI_LIMITS.heightCmMax) {
        errors.heightCm = `Height must be between ${BMI_LIMITS.heightCmMin} and ${BMI_LIMITS.heightCmMax} cm (about 3′6″–8′0″).`;
      } else if (decimalsTooLong(cmRaw, 1)) {
        errors.heightCm = "Use at most one decimal place for cm (e.g. 175.5).";
      }
    }
  }

  if (!weightRaw) {
    errors.weight =
      weightUnit === "lb"
        ? "Weight in pounds is required."
        : "Weight in kilograms is required.";
  } else {
    const w = parseFloat(weightRaw);
    if (!Number.isFinite(w)) {
      errors.weight = "Enter a valid weight number.";
    } else if (w <= 0) {
      errors.weight = "Weight must be greater than zero.";
    } else {
      const kg = weightUnit === "lb" ? lbToKg(w) : w;
      if (kg < BMI_LIMITS.weightKgMin) {
        errors.weight =
          weightUnit === "lb"
            ? `Weight is too low (below ~${BMI_LIMITS.weightKgMin} kg).`
            : `Weight must be at least ${BMI_LIMITS.weightKgMin} kg.`;
      } else if (kg > BMI_LIMITS.weightKgMax) {
        errors.weight =
          weightUnit === "lb"
            ? `Weight is too high (above ~${BMI_LIMITS.weightKgMax} kg).`
            : `Weight must be at most ${BMI_LIMITS.weightKgMax} kg.`;
      } else if (decimalsTooLong(weightRaw, 2)) {
        errors.weight = "Use at most two decimal places.";
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
    errors.heightCm ||
    errors.weight ||
    errors.age ||
    null;

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    firstMessage,
    heightUnit,
    weightUnit,
  };
}

/**
 * After validation passes: height in m, weight in kg, and ft/in for the API.
 */
export function computeBmiFromForm(formData) {
  const heightUnit = formData.heightUnit === "metric" ? "metric" : "imperial";
  const weightUnit = formData.weightUnit === "lb" ? "lb" : "kg";

  let heightMeters;
  let heightFeet;
  let heightInches;

  if (heightUnit === "metric") {
    const cm = parseFloat(
      String(formData.heightCm).trim().replace(",", ".")
    );
    heightMeters = cm / 100;
    const fi = cmToFtIn(cm);
    heightFeet = fi.feet;
    heightInches = fi.inches;
  } else {
    heightFeet = parseInt(formData.heightFeet, 10);
    heightInches = parseInt(formData.heightInches, 10);
    heightMeters = heightMetersFromFtIn(heightFeet, heightInches);
  }

  const wRaw = parseFloat(
    String(formData.weight).trim().replace(",", ".")
  );
  const weightKg = weightUnit === "lb" ? lbToKg(wRaw) : wRaw;
  const bmiNum = weightKg / (heightMeters * heightMeters);

  return {
    heightMeters,
    weightKg,
    heightFeet,
    heightInches,
    bmiNum,
  };
}

export function bmiCategoryFromValue(bmiNum) {
  if (bmiNum < 18.5) return "Underweight";
  if (bmiNum < 24.9) return "Normal weight";
  if (bmiNum < 29.9) return "Overweight";
  if (bmiNum < 35) return "Obese";
  return "Morbid obesity";
}
