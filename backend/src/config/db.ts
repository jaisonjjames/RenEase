import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let mongoServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  if (env.mongoUri) {
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return;
  }

  if (!env.useInMemoryDb) {
    throw new Error('MONGO_URI is not set. For local-only demos you can set USE_IN_MEMORY_DB=true.');
  }

  mongoServer = await MongoMemoryServer.create();
  const memoryUri = mongoServer.getUri();
  await mongoose.connect(memoryUri);
  console.log(`Memory MongoDB connected: ${memoryUri}`);
};
