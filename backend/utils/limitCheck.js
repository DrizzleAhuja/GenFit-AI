const User = require("../models/User");

const FREE_TIER_LIMITS = {
  vtaUsage: 5,
  photoUsage: 5,
};

const EXCEPTION_EMAILS = [
  "kumarprasadaman1234@gmail.com",
  "study.drizzle@gmail.com"
];

/**
 * Checks if the user is allowed to use a restricted feature and increments their usage counter if so.
 * @param {String} userId - The user's ID
 * @param {String} feature - "vtaUsage" or "photoUsage"
 * @returns {Promise<{ allowed: boolean, message?: string }>}
 */
const checkAndIncrementLimit = async (userId, feature) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      return { allowed: false, message: "User not found" };
    }

    // 1. Check for hardcoded exceptions
    if (EXCEPTION_EMAILS.includes(user.email)) {
      return { allowed: true };
    }

    // 2. Pro plan users have no limits
    if (user.plan === "pro") {
      return { allowed: true };
    }

    // Initialize limits object if it doesn't exist
    if (!user.limits) {
      user.limits = { vtaUsage: 0, photoUsage: 0, lastResetAt: new Date() };
    }

    // 3. Reset logic: Check if a new month has started since lastResetAt
    const now = new Date();
    const lastReset = user.limits.lastResetAt ? new Date(user.limits.lastResetAt) : new Date(0);
    
    // If the month or year changed, reset the limits
    if (now.getMonth() !== lastReset.getMonth() || now.getFullYear() !== lastReset.getFullYear()) {
      user.limits.vtaUsage = 0;
      user.limits.photoUsage = 0;
      user.limits.lastResetAt = now;
    }

    // 4. Enforce free tier bounds
    const currentUsage = user.limits[feature] || 0;
    const maxAllowed = FREE_TIER_LIMITS[feature];

    if (currentUsage >= maxAllowed) {
      return { 
        allowed: false, 
        message: `You have reached your free tier limit of ${maxAllowed} requests for this feature this month. Please upgrade to Pro to continue.`
      };
    }

    // 5. Increment usage
    user.limits[feature] = currentUsage + 1;
    // Mark the nested 'limits' field as modified to satisfy Mongoose
    user.markModified("limits");
    await user.save();

    return { allowed: true };
  } catch (error) {
    console.error("Error in checkAndIncrementLimit:", error);
    return { allowed: false, message: "Internal server error while verifying limits." };
  }
};

module.exports = { checkAndIncrementLimit };
