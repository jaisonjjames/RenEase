import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import { env } from './config/env';

import categoryRoutes from './routes/categoryRoutes';
import assetRoutes from './routes/assetRoutes';
import rentalRoutes from './routes/rentalRoutes';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import User from './models/User';
import Category from './models/Category';
import Asset from './models/Asset';

const app = express();
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.corsOrigins.length === 0 || env.corsOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  })
);
app.use(express.json());

// Routes
app.use('/api/categories', categoryRoutes);
app.use('/api/assets', assetRoutes);
app.use('/api/rentals', rentalRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'RentEase API is running' });
});

const seedAdmin = async () => {
  if (!env.enableDemoSeeding) {
    return;
  }

  try {
    const adminExists = await User.findOne({ email: env.demoAdmin.email });
    if (!adminExists) {
      const newAdmin = new User({
        name: env.demoAdmin.name,
        email: env.demoAdmin.email,
        password: env.demoAdmin.password,
        role: 'superadmin'
      });
      await newAdmin.save();
      console.log(`Seeded demo superadmin account: ${env.demoAdmin.email}`);
    }
  } catch (err) {
    console.error('Failed to seed admin', err);
  }
};

const seedData = async () => {
  if (!env.enableDemoSeeding) {
    return;
  }

  try {
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log('Seeding initial mock categories and assets...');
      const c1 = new Category({ name: 'Beach Chairs', slug: 'beach-chairs', description: 'Comfortable loungers.', displayOrder: 1 });
      const c2 = new Category({ name: 'Umbrellas', slug: 'umbrellas', description: 'Stay cool.', displayOrder: 2 });
      await Promise.all([c1.save(), c2.save()]);

      const a1 = new Asset({ name: 'Premium Recliner Chair', category_id: c1._id, location: 'South Beach', price_per_hour: 15, deposit_amount: 20, status: 'available' });
      const a2 = new Asset({ name: 'Standard Beach Chair', category_id: c1._id, location: 'Miami Beach', price_per_hour: 10, deposit_amount: 10, status: 'available' });
      const a3 = new Asset({ name: 'Large UV Umbrella', category_id: c2._id, location: 'South Beach', price_per_hour: 12, deposit_amount: 15, status: 'available' });
      await Promise.all([a1.save(), a2.save(), a3.save()]);
      console.log('Finished seeding data.');
    }
  } catch (err) {
    console.error('Failed to seed data', err);
  }
};

const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();
    await seedData();
    app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
};

startServer();
