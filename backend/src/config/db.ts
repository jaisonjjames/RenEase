import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  try {
    // Try to connect to real MongoDB first
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/rentease';
    const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 2000 });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`MongoDB Connection Error: ${error.message} - Falling back to Memory Server.`);
    } else {
      console.error('An unknown error occurred during MongoDB connection.');
    }
    
    // Fallback to Memory Server so the app still runs perfectly
    try {
      mongoServer = await MongoMemoryServer.create();
      const memoryUri = mongoServer.getUri();
      await mongoose.connect(memoryUri);
      console.log(`Memory MongoDB Connected successfully at ${memoryUri}`);
    } catch (memError) {
      console.error("Critical failure: Could not start memory server either.");
    }
  }
};
