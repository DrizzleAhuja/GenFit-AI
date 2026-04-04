const mongoose = require("mongoose");

const maintenanceRunSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  runAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("MaintenanceRun", maintenanceRunSchema);
