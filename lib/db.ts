import mongoose from "mongoose";

const MONGOOSE_URI = process.env.MONGOOSE_URI;

if (!MONGOOSE_URI) {
  throw new Error("please provide MONGOOSE_URI in env file");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }
  if (!cached.promise) {
    const opts = {
      bufferCommands: true,
      maxPoolSize: 10,
    };
    cached.promise = mongoose
      .connect(MONGOOSE_URI, opts)
      .then(() => mongoose.connection);
  }
  try {
    cached.conn = await cached.promise;
    console.log("db connected");
  } catch (error) {
    cached.promise = null;
    throw error;
  }
  return cached.conn;
};
