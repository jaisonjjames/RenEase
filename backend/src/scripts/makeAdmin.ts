import mongoose from 'mongoose';
import { connectDB } from '../config/db';
import User from '../models/User';

type Role = 'admin' | 'superadmin';

const getArgValue = (flag: string) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return undefined;
  return process.argv[index + 1];
};

const hasFlag = (flag: string) => process.argv.includes(flag);

const normalizeRole = (value?: string): Role => {
  if (value === 'superadmin') return 'superadmin';
  return 'admin';
};

const printUsage = () => {
  console.log(`
Usage:
  npm run make-admin -- --email you@example.com [--role admin|superadmin]

Optional create-if-missing mode:
  npm run make-admin -- --email you@example.com --name "Your Name" --password "StrongPassword123" [--role admin|superadmin]

What it does:
  - If the user exists, it promotes them to the requested role.
  - If the user does not exist, it only creates them when both --name and --password are provided.
`);
};

const main = async () => {
  const email = getArgValue('--email')?.trim().toLowerCase();
  const name = getArgValue('--name')?.trim();
  const password = getArgValue('--password')?.trim();
  const role = normalizeRole(getArgValue('--role'));

  if (!email || hasFlag('--help')) {
    printUsage();
    process.exit(email ? 0 : 1);
  }

  await connectDB();

  let user = await User.findOne({ email });

  if (!user) {
    if (!name || !password) {
      throw new Error(
        `User ${email} does not exist. Re-run with --name and --password to create the account, or register the user first.`
      );
    }

    user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();
    console.log(`Created ${role} user: ${email}`);
    return;
  }

  user.role = role;
  await user.save();
  console.log(`Updated ${email} to role: ${role}`);
};

main()
  .catch((error) => {
    console.error('Admin bootstrap failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close();
  });
