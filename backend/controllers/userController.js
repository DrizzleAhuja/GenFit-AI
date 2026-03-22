const User = require("../models/User");

const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, diseases, allergies, avatar } = req.body;

  try {
    // Check if user exists
    const existingUser = await User.findById(id);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    const updateData = { firstName, lastName };
    if (diseases !== undefined) updateData.diseases = diseases;
    if (allergies !== undefined) updateData.allergies = allergies;
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    console.log("User updated successfully:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res
      .status(500)
      .json({ message: "Error updating profile", error: error.message });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};

module.exports = { updateUser, getUser };
