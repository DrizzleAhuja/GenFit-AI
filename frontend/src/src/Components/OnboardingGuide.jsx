import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X, Check, Scale, Dumbbell, Utensils, Sparkles, ArrowRight } from "lucide-react";

const MODAL_KEY = "genfit_onboarding_modal_v1_done";
const BANNER_KEY = "genfit_onboarding_banner_v1_dismissed";

const steps = [
  {
    id: "bmi",
    title: "Calculate your BMI",
    description: "Unlock personalized calorie targets, diet charts, and safer workout plans.",
    path: "/CurrentBMI",
    cta: "Open BMI",
    Icon: Scale,
  },
  {
    id: "workout",
    title: "Train with a plan",
    description: "Generate a plan from Workout, then log sessions here to fill your dashboard.",
    path: "/Workout",
    cta: "Workouts",
    Icon: Dumbbell,
  },
  {
    id: "nutrition",
    title: "Log your meals",
    description: "Use Calorie Tracker to stay on budget and see intake trends on your home dashboard.",
    path: "/calorie-tracker",
    cta: "Calorie Tracker",
    Icon: Utensils,
  },
];

/**
 * First-time welcome modal + checklist until core actions are done (or user dismisses banner).
 */
export default function OnboardingGuide({ loading, bmiHistory, sessionLogs, calorieHistory }) {
  const [showModal, setShowModal] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(BANNER_KEY) === "1"
  );

  const hasBmi = (bmiHistory?.length || 0) > 0;
  const hasWorkout = (sessionLogs?.length || 0) > 0;
  const hasCalories = (calorieHistory || []).some((log) => (Number(log.totalCalories) || 0) > 0);

  const doneFlags = {
    bmi: hasBmi,
    workout: hasWorkout,
    nutrition: hasCalories,
  };

  const completeCount = [hasBmi, hasWorkout, hasCalories].filter(Boolean).length;
  const allDone = completeCount === 3;

  useEffect(() => {
    if (loading || typeof window === "undefined") return;
    if (localStorage.getItem(MODAL_KEY) === "1") return;
    setShowModal(true);
  }, [loading]);

  const closeModal = () => {
    localStorage.setItem(MODAL_KEY, "1");
    setShowModal(false);
  };

  const dismissBanner = () => {
    localStorage.setItem(BANNER_KEY, "1");
    setBannerDismissed(true);
  };

  if (loading) return null;

  return (
    <>
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="onboarding-welcome-title"
        >
          <div className="relative w-full max-w-lg rounded-2xl border border-[#8B5CF6]/40 bg-[#05010d] shadow-[0_0_60px_rgba(139,92,246,0.35)] overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#22D3EE]" />
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Close welcome guide"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 sm:p-8 pt-10">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-6 h-6 text-[#FACC15]" />
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#22D3EE]">
                  Quick start
                </span>
              </div>
              <h2 id="onboarding-welcome-title" className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Welcome to GenFit AI
              </h2>
              <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                Do these three things in order to get the most from the app. After you close this, a checklist stays on
                your dashboard until you finish or hide it — shortcuts are always in Quick Actions too.
              </p>
              <ol className="space-y-4 mb-8">
                {steps.map((s, i) => {
                  const Icon = s.Icon;
                  const done = doneFlags[s.id];
                  return (
                    <li
                      key={s.id}
                      className={`flex gap-3 rounded-xl border p-3 sm:p-4 ${
                        done ? "border-emerald-500/35 bg-emerald-500/5" : "border-[#1F2937] bg-[#020617]/80"
                      }`}
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1F2937] text-sm font-bold text-white">
                        {done ? <Check className="w-4 h-4 text-emerald-400" /> : i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Icon className="w-4 h-4 text-[#A855F7] shrink-0" />
                          <span className="font-semibold text-white">{s.title}</span>
                          {done && (
                            <span className="text-[10px] font-bold uppercase text-emerald-400">Done</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.description}</p>
                        {!done && (
                          <Link
                            to={s.path}
                            onClick={closeModal}
                            className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#22D3EE] hover:text-white transition-colors"
                          >
                            {s.cta}
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
              <button
                type="button"
                onClick={closeModal}
                className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] hover:opacity-95 transition-opacity shadow-lg"
              >
                Continue to dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {!bannerDismissed && !allDone && (
        <div className="mb-6 sm:mb-8 rounded-2xl border border-[#22D3EE]/30 bg-gradient-to-br from-[#8B5CF6]/10 via-[#020617]/90 to-[#22D3EE]/10 p-4 sm:p-5 shadow-[0_12px_40px_rgba(15,23,42,0.9)] relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE]" />
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FACC15]" />
                Your setup checklist
              </h3>
              <p className="text-xs text-gray-400 mt-1">
                {completeCount}/3 complete — finish the rest to unlock the full dashboard experience.
              </p>
            </div>
            <button
              type="button"
              onClick={dismissBanner}
              className="self-end sm:self-start text-xs font-semibold text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-white/5"
            >
              Hide checklist
            </button>
          </div>
          <div className="h-1.5 rounded-full bg-[#1F2937] mb-4 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#22D3EE] transition-all duration-500"
              style={{ width: `${(completeCount / 3) * 100}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {steps.map((s) => {
              const Icon = s.Icon;
              const done = doneFlags[s.id];
              return (
                <Link
                  key={s.id}
                  to={s.path}
                  className={`flex flex-col rounded-xl border p-3 transition-all ${
                    done
                      ? "border-emerald-500/40 bg-emerald-500/5 pointer-events-none opacity-90"
                      : "border-[#1F2937] bg-[#020617]/70 hover:border-[#22D3EE]/50 hover:shadow-[0_0_20px_rgba(34,211,238,0.12)]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-4 h-4 ${done ? "text-emerald-400" : "text-[#22D3EE]"}`} />
                    <span className="text-sm font-bold text-white">{s.title}</span>
                    {done && <Check className="w-4 h-4 text-emerald-400 ml-auto" />}
                  </div>
                  <span className="text-[11px] text-gray-500 leading-snug flex-1">{s.description}</span>
                  {!done && (
                    <span className="text-xs font-bold text-[#C4B5FD] mt-2 inline-flex items-center gap-1">
                      Go <ArrowRight className="w-3 h-3" />
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
