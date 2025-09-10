import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: { type: String, required: true },
  productname: { type: String, required: true },
  email: {type: String, required: true},
  content: { type: String, required: true },
  rating: { type: Number, default: 5 },
  color: { type: String },
  rom: { type: String },
  createdAt: { type: Date, default: Date.now }
});


export default mongoose.model('Comment', commentSchema);
