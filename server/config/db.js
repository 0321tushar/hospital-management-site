import mongoose from 'mongoose';
import dns from 'dns';

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';
  
  // Resolve SRV records reliably if local ISP DNS refuses them on Windows
  if (uri.startsWith('mongodb+srv://')) {
    try {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
    } catch (e) {
      // Ignore if cannot set servers in current environment
    }
  }
  
  const maskedUri = uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000 // Timeout after 8s if network/cluster is unreachable
    });
    console.log(`[MongoDB Connected]: ${conn.connection.host} / ${conn.connection.name}`);
    return true;
  } catch (error) {
    console.warn(`[MongoDB Warning]: Could not connect to MongoDB (${maskedUri}).`);
    console.warn(`[MongoDB Error Details]: ${error.message}`);
    console.warn(`[Fallback Active]: Server will run in in-memory / seed fallback mode until MongoDB connects.`);
    console.warn(`[Tip]: Check server/.env MONGO_URI and make sure your IP is whitelisted in MongoDB Atlas Network Access.`);
    return false;
  }
};
