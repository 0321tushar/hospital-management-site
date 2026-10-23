import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000 // Timeout after 5s if mongo daemon isn't running
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB at ${uri}.`);
    console.warn(`[Fallback Active]: Server will run in in-memory / seed fallback mode until local MongoDB is started.`);
    console.warn(`[Tip]: Start your MongoDB service (e.g. 'net start MongoDB' or 'mongod') or provide a MongoDB Atlas URI in server/.env`);
    return false;
  }
};
