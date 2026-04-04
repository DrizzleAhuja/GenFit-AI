/**
 * BMI + workout-aware maintenance calories, goal-adjusted targets, and macro grams.
 */

function heightToCm(feet, inches) {
  const fi = Number(feet) || 0;
  const inch = Number(inches) || 0;
  return (fi * 12 + inch) * 2.54;
}

function mifflinBMR(kg, cm, age, isMale) {
  return 10 * kg + 6.25 * cm - 5 * age + (isMale ? 5 : -161);
}

function activityMultiplier(workoutParams) {
  const d = Math.min(Math.max(Number(workoutParams?.daysPerWeek) || 3, 0), 7);
  const inten = String(workoutParams?.intensity || "").toLowerCase();
  let m = 1.2 + d * 0.08;
  if (/high|adv|very|extreme/i.test(inten)) m += 0.12;
  if (/low|begin|light|sedentary/i.test(inten)) m -= 0.1;
  return Math.min(Math.max(m, 1.2), 1.95);
}

function normalizeGoal(goal) {
  const raw = String(goal || "").trim();
  const g = raw.toLowerCase().replace(/-/g, "_");

  if (!raw) return "maintain";

  if (
    g.includes("lose") ||
    (g.includes("loss") && (g.includes("weight") || g.includes("fat"))) ||
    /\b(slim|cutting|deficit)\b/i.test(raw)
  ) {
    return "lose_weight";
  }
  if (
    (g.includes("gain") || g.includes("bulk")) &&
    !g.includes("muscle") &&
    !g.includes("hypertrophy")
  ) {
    return "gain_weight";
  }
  if (g.includes("muscle") || g.includes("hypertrophy") || /^build_?musc/i.test(g)) {
    return "build_muscles";
  }
  if (/general\s*fitness|^fitness$|^general$/i.test(raw)) {
    return "maintain";
  }
  return "maintain";
}

/**
 * Many saved plans store fitnessGoal as "General Fitness" while the real intent is in the plan name
 * or BMI selectedPlan. Merge those signals so lose/gain/muscle targets apply correctly.
 */
function resolveFitnessGoal(workoutParams, planName, bmiSelectedPlan) {
  const params = workoutParams || {};
  const candidates = [params.fitnessGoal, params.goal, bmiSelectedPlan].filter(
    (x) => x != null && String(x).trim() !== ""
  );

  for (const c of candidates) {
    const str = String(c).trim();
    if (/^general\s*fitness$/i.test(str)) continue;
    const nk = normalizeGoal(str);
    if (nk !== "maintain") return str;
  }

  const name = String(planName || "").toLowerCase();
  if (/\b(lose|loss|slim|cutting|deficit|fat\s*burn)\b/i.test(name) || /lose\s*weight/i.test(name)) {
    return "lose_weight";
  }
  if (/\bgain\s*weight\b|\bbulk\b/i.test(name) && !/muscle/i.test(name)) {
    return "gain_weight";
  }
  if (/\b(build\s*)?muscle|hypertrophy|strength\b/i.test(name)) {
    return "build_muscles";
  }

  if (candidates.length) return String(candidates[0]);
  return "maintain";
}

function targetCalories(maintenance, goalKey) {
  if (goalKey === "lose_weight") {
    const deficit = Math.min(Math.max(Math.round(maintenance * 0.18), 300), 650);
    return Math.max(Math.round(maintenance - deficit), 1300);
  }
  if (goalKey === "gain_weight") return Math.round(maintenance + 400);
  if (goalKey === "build_muscles") return Math.round(maintenance + 300);
  return Math.round(maintenance);
}

function macroGrams(targetCal, weightKg, goalKey) {
  let proteinPerKg = 1.6;
  if (goalKey === "lose_weight") proteinPerKg = 2.0;
  if (goalKey === "build_muscles" || goalKey === "gain_weight") proteinPerKg = 2.0;
  const proteinG = Math.min(
    Math.round(weightKg * proteinPerKg),
    Math.round((targetCal * 0.38) / 4)
  );
  const fatG = Math.round((targetCal * 0.28) / 9);
  const protCals = proteinG * 4;
  const fatCals = fatG * 9;
  const carbCals = Math.max(targetCal - protCals - fatCals, 0);
  const carbsG = Math.round(carbCals / 4);
  return { proteinG, carbsG, fatG };
}

function computeNutritionTargets({
  weightKg,
  heightFeet,
  heightInches,
  age,
  gender,
  fitnessGoal,
  workoutParams,
}) {
  const kg = Number(weightKg);
  const a = Number(age);
  const cm = heightToCm(heightFeet, heightInches);
  if (!Number.isFinite(kg) || kg <= 0 || !Number.isFinite(a) || a <= 0 || !Number.isFinite(cm) || cm <= 0) {
    return null;
  }

  const g = String(gender || "").toLowerCase();
  const male = g === "male" || g === "m";
  const female = g === "female" || g === "f";
  const bmr = male
    ? mifflinBMR(kg, cm, a, true)
    : female
      ? mifflinBMR(kg, cm, a, false)
      : (mifflinBMR(kg, cm, a, true) + mifflinBMR(kg, cm, a, false)) / 2;

  const act = activityMultiplier(workoutParams || {});
  const maintenance = Math.round(bmr * act);
  const goalKey = normalizeGoal(fitnessGoal);
  const targetCal = targetCalories(maintenance, goalKey);
  const macros = macroGrams(targetCal, kg, goalKey);

  return {
    maintenanceCalories: maintenance,
    targetCalories: targetCal,
    goalKey,
    bmr: Math.round(bmr),
    activityFactor: Math.round(act * 100) / 100,
    ...macros,
  };
}

function inferMacrosFromCalories(kcal) {
  const k = Number(kcal);
  if (!Number.isFinite(k) || k <= 0) {
    return { proteinG: 0, carbsG: 0, fatG: 0 };
  }
  const fatG = Math.max(Math.round((k * 0.3) / 9), 0);
  const proteinG = Math.max(Math.round((k * 0.25) / 4), 0);
  const carbG = Math.max(Math.round((k - proteinG * 4 - fatG * 9) / 4), 0);
  return { proteinG, carbsG: carbG, fatG };
}

module.exports = {
  computeNutritionTargets,
  normalizeGoal,
  resolveFitnessGoal,
  inferMacrosFromCalories,
};
