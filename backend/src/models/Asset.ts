import mongoose, { Schema, Document } from 'mongoose';

export interface IAsset extends Document {
  name: string;
  type: string;
  category_id: mongoose.Types.ObjectId;
  status: 'available' | 'rented' | 'maintenance' | 'unavailable';
  location: string;
  price_per_hour: number;
  deposit_amount: number;
  imageUrl?: string;
  metadata?: any;
}

const AssetSchema: Schema = new Schema({
  name: { type: String, required: true },
  type: { type: String },
  category_id: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  status: { type: String, enum: ['available', 'rented', 'maintenance', 'unavailable'], default: 'available' },
  location: { type: String },
  price_per_hour: { type: Number, required: true },
  deposit_amount: { type: Number, required: true },
  imageUrl: { type: String },
  metadata: { type: Schema.Types.Mixed }
}, {
  timestamps: true
});

export default mongoose.model<IAsset>('Asset', AssetSchema);
