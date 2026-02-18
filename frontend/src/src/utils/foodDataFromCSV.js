/**
 * Load food data from food1.csv (in public folder) and look up calories by name.
 * Replaces foodCalorieMap.js — uses AI/food1.csv data (8000+ foods).
 */
import Papa from "papaparse";

const CSV_URL = "/food1.csv";

// Non-food ImageNet classes to skip (same as before)
const SKIP_KEYWORDS = [
  "hip", "rose hip", "rosehip", "vase", "pot", "flowerpot", "flower pot",
  "hay", "grocery store", "restaurant", "bakery", "menu", "measuring cup",
  "plate rack", "dishrag", "dishcloth"
];

function normalize(str) {
  if (!str || typeof str !== "string") return "";
  return str.toLowerCase().trim();
}

function isSkipItem(className) {
  const n = normalize(className);
  if (!n) return true;
  return SKIP_KEYWORDS.some(skip => n.includes(skip));
}

/**
 * Load and parse food1.csv. Returns array of { displayName, calories, key }.
 * CSV columns: Energ_Kcal (index 2), Shrt_Desc (last column).
 */
export function loadFoodData() {
  return new Promise((resolve, reject) => {
    Papa.parse(CSV_URL, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data || [];
        const out = [];
        for (const row of rows) {
          const desc = row["Shrt_Desc"] || row.Short_Desc || row.Shrt_Desc || "";
          const cal = parseFloat(row["Energ_Kcal"] ?? row.Energ_Kcal ?? 0);
          if (!desc || isNaN(cal)) continue;
          const key = normalize(desc.split(",")[0] || desc); // first part e.g. "apples"
          out.push({
            displayName: desc.replace(/,/g, ", ").trim(),
            calories: Math.round(cal),
            key: key
          });
        }
        resolve(out);
      },
      error: (err) => reject(err)
    });
  });
}

/**
 * Find best matching food from CSV data for a MobileNet class name.
 * Returns { displayName, calories } or null if not food / skip.
 */
export function getFoodCalorie(className, foodData) {
  if (!className || !Array.isArray(foodData) || foodData.length === 0) {
    return null;
  }
  if (isSkipItem(className)) return null;

  const n = normalize(className);
  const parts = n.split(",").map(p => p.trim()).filter(Boolean);

  // Try each part (e.g. "hip, rose hip, rosehip" -> skip)
  for (const part of parts) {
    if (isSkipItem(part)) continue;

    // 1) Exact key match (e.g. "grapes" -> row.key === "grapes")
    let match = foodData.find(row => row.key === part);
    if (match) return { displayName: match.displayName, calories: match.calories };

    // 2) Key contains part or part contains key (e.g. "grape" -> "grapes")
    match = foodData.find(row => row.key.includes(part) || part.includes(row.key));
    if (match) return { displayName: match.displayName, calories: match.calories };

    // 3) displayName contains part (e.g. "granny smith" -> "APPLES,RAW,...")
    const withRaw = foodData.filter(row =>
      normalize(row.displayName).includes(part)
    );
    if (withRaw.length > 0) {
      const raw = withRaw.find(row => normalize(row.displayName).includes("raw"));
      const best = raw || withRaw[0];
      return { displayName: best.displayName, calories: best.calories };
    }
  }

  // 4) Full className match over keys
  const fullMatch = foodData.find(row => row.key === n);
  if (fullMatch) return { displayName: fullMatch.displayName, calories: fullMatch.calories };

  const partialMatch = foodData.find(row =>
    row.key.includes(n) || n.includes(row.key)
  );
  if (partialMatch) return { displayName: partialMatch.displayName, calories: partialMatch.calories };

  return null;
}

/**
 * Get food by filename hint (e.g. "grape" from "grape.jpg") using CSV data.
 * Used when user uploads "grape.jpg" but model returns something else.
 */
export function getFoodByFilename(filenameWord, foodData) {
  if (!filenameWord || !Array.isArray(foodData) || foodData.length === 0) return null;
  const w = normalize(filenameWord.replace(/\.(jpg|jpeg|png|webp|gif|bmp)$/i, ""));
  if (!w || w.length < 2) return null;
  const match = foodData.find(row =>
    row.key.includes(w) || w.includes(row.key)
  );
  if (match) return { displayName: match.displayName, calories: match.calories };
  const byDesc = foodData.find(row =>
    normalize(row.displayName).includes(w)
  );
  return byDesc ? { displayName: byDesc.displayName, calories: byDesc.calories } : null;
}
