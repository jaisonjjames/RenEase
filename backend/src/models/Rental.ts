import mongoose, { Schema, Document } from 'mongoose';

export interface IRental extends Document {
  asset_id: mongoose.Types.ObjectId;
  user_id?: mongoose.Types.ObjectId;
  user_info: {
    name: string;
    phone: string;
    email?: string;
  };
  start_time: Date;
  end_time?: Date;
  status: 'active' | 'completed' | 'cancelled' | 'pending_payment';
  payment_id?: string;
  deposit_amount: number;
  rental_amount: number;
}

const RentalSchema: Schema = new Schema({
  asset_id: { type: Schema.Types.ObjectId, ref: 'Asset', required: true },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  user_info: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String }
  },
  start_time: { type: Date, default: Date.now },
  end_time: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'cancelled', 'pending_payment'], default: 'pending_payment' },
  payment_id: { type: String },
  deposit_amount: { type: Number, required: true },
  rental_amount: { type: Number, required: true }
}, {
  timestamps: true
});

export default mongoose.model<IRental>('Rental', RentalSchema);
