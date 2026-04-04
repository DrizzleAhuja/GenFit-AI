const User = require("../models/User");

function endOfCalendarDay(d) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * Remove weeklyChallenge from all users whose admin challenge end date has passed (end day inclusive).
 */
async function expireEndedWeeklyChallenges() {
  const now = new Date();
  const users = await User.find({
    "weeklyChallenge.weekEndAt": { $exists: true, $ne: null },
    "weeklyChallenge.title": { $exists: true, $nin: [null, ""] },
  })
    .select("_id weeklyChallenge")
    .lean();

  const ids = [];
  for (const u of users) {
    const end = u.weeklyChallenge?.weekEndAt;
    if (!end) continue;
    if (now > endOfCalendarDay(new Date(end))) {
      ids.push(u._id);
    }
  }

  if (ids.length === 0) return { cleared: 0 };

  const result = await User.updateMany({ _id: { $in: ids } }, { $unset: { weeklyChallenge: 1 } });
  return { cleared: result.modifiedCount ?? ids.length };
}

/**
 * Returns active challenge sample from DB (after caller runs expire), or null.
 */
async function getActiveChallengeSample() {
  const now = new Date();
  const u = await User.findOne({
    "weeklyChallenge.title": { $exists: true, $nin: [null, ""] },
    "weeklyChallenge.weekEndAt": { $exists: true, $ne: null },
  })
    .select("weeklyChallenge")
    .lean();

  if (!u?.weeklyChallenge?.title) return null;
  const end = u.weeklyChallenge.weekEndAt;
  if (now > endOfCalendarDay(new Date(end))) return null;
  return u.weeklyChallenge;
}

/**
 * Challenge row shown in admin (any user). Includes legacy rows missing weekEndAt.
 * Skips challenges whose end date has already passed (after expire has run).
 */
async function getAdminCurrentChallengeSample() {
  const u = await User.findOne({
    "weeklyChallenge.title": { $exists: true, $nin: [null, ""] },
  })
    .select("weeklyChallenge")
    .lean();

  if (!u?.weeklyChallenge?.title) return null;

  const end = u.weeklyChallenge.weekEndAt;
  if (end != null && end !== "") {
    if (new Date() > endOfCalendarDay(new Date(end))) {
      return null;
    }
  }
  return u.weeklyChallenge;
}

module.exports = {
  expireEndedWeeklyChallenges,
  endOfCalendarDay,
  getActiveChallengeSample,
  getAdminCurrentChallengeSample,
};
