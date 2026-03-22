import { API_BASE_URL } from "../../config/api";

export async function analyzePosture(exerciseType, landmarks, userId = null) {
  const res = await fetch(`${API_BASE_URL}/api/posture/analyze`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ exerciseType, landmarks, userId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Posture analysis failed");
  }

  return res.json();
}


