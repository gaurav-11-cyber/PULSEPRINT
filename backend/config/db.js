const mongoose = require("mongoose");

let dbReady = false;

async function connectDB() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/pulseprint";

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      maxPoolSize: 10,
    });
    dbReady = true;
    // eslint-disable-next-line no-console
    console.log("MongoDB connected");
  } catch (error) {
    dbReady = false;
    // eslint-disable-next-line no-console
    console.warn("MongoDB unavailable, running with simulation memory store only.");
  }

  return dbReady;
}

function isDBReady() {
  return dbReady && mongoose.connection.readyState === 1;
}

module.exports = { connectDB, isDBReady };

