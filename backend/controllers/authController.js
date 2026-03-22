// controllers/authController.js
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.login = async (req, res) => {
  const { token, role } = req.body; // Accept role in the request body

  try {
    const audienceEnv = process.env.GOOGLE_CLIENT_IDS || process.env.GOOGLE_CLIENT_ID;
    const audience = audienceEnv && audienceEnv.includes(",")
      ? audienceEnv.split(",").map((value) => value.trim()).filter(Boolean)
      : audienceEnv;

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience,
    });
    const {
      email,
      given_name: firstName,
      family_name: lastName,
    } = ticket.getPayload();

    const ADMIN_EMAILS = ["kumarprasadaman1234@gmail.com", "drizzle003.ace@gmail.com", "study.drizzle@gmail.com"];

    const EXCEPTION_EMAILS = ["kumarprasadaman1234@gmail.com", "study.drizzle@gmail.com"];

    // Check for admin role validation
    if (role === "admin" && !ADMIN_EMAILS.includes(email)) {
      console.error("Invalid admin email:", email);
      return res.status(400).json({ message: "Invalid admin email" });
    }

    // Auto-assign admin role for designated emails
    const roleToAssign = ADMIN_EMAILS.includes(email) ? "admin" : (role || "user");
    const isException = EXCEPTION_EMAILS.includes(email);

    // Find or create the user
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({ 
        firstName, 
        lastName, 
        email, 
        role: roleToAssign,
        plan: isException || ADMIN_EMAILS.includes(email) ? "pro" : "free" // Admin should also be PRO
      });
      await user.save();
    } else {
      user.role = roleToAssign;
      if (isException || ADMIN_EMAILS.includes(email)) {
        user.plan = "pro";
      }
      await user.save();
    }


    res.status(200).json({ message: "Logged in successfully", user });
  } catch (error) {
    console.error("Login error:", error); // Add this for debugging
    res.status(500).json({ error: "Internal Server Error", details: error.message });
  }
};
