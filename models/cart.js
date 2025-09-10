import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  rom: String,
  color: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  userInfo: {
    fullName: String,
    address: String,
    numberPhone: String,
    email: String,
  },
}, { timestamps: true });

const cart = mongoose.model("Cart", cartSchema);

export default cart;
