const mongoose = require("mongoose");

// In serverless (Vercel), we must cache the connection across invocations
// to avoid reconnecting on every request / getting frequent disconnects.
let cached = global.__MONGOOSE_CONN__;

if (!cached) {
  cached = global.__MONGOOSE_CONN__ = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) return cached.conn;

  const mongoUrl = process.env.MONGODB_URL;
  const mongoDbName = process.env.MONGODB_DB;

  if (!mongoUrl) {
    throw new Error("Missing MONGODB_URL env var");
  }

  if (!cached.promise) {
    // Reduce confusing "buffering timed out" errors: fail fast if not connected.
    mongoose.set("bufferCommands", false);

    const options = {
      dbName: mongoDbName || undefined,
      // More tolerant settings for serverless + Atlas
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 0,
      heartbeatFrequencyMS: 10000,
      retryWrites: true,
    };

    cached.promise = mongoose
      .connect(mongoUrl, options)
      .then((mongooseInstance) => mongooseInstance);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = { connectDB };


