import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  role: 'superadmin' | 'admin' | 'customer';
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  phone: { type: String },
  role: { type: String, enum: ['superadmin', 'admin', 'customer'], default: 'customer' }
}, {
  timestamps: true
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) return;
  const password = this.password as string;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
