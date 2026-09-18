import mongoose from 'mongoose';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5001;

/**
 * Connect to MongoDB with automatic retry on failure.
 * @param {number} [retries=0] - Current retry attempt count
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (retries = 0) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    // console.log(`MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    console.log("MongoDB Connected: ");

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected successfully');
    });

    return conn;
  } catch (error) {
    console.error(
      `MongoDB connection failed (attempt ${retries + 1}/${MAX_RETRIES}): ${error.message}`
    );

    if (retries < MAX_RETRIES - 1) {
      console.log(`Retrying in ${RETRY_DELAY_MS / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retries + 1);
    }

    throw new Error(
      `Exhausted MongoDB connection retries after ${MAX_RETRIES} attempts: ${error.message}`
    );
  }
};

export default connectDB;
