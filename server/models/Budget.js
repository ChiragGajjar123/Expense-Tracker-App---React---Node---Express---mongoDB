import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  categoryId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  period: { type: String, default: 'monthly' }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

export default mongoose.model('Budget', budgetSchema);
