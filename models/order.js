import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: String,
});

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
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
  paymentStatus: {
    type: String,
    enum: ["pending", "success", "failed"],
    default: "pending",
  },
  orderStatus: {
    type: String,
    enum: ["Chờ xác nhận", "Đang giao", "Đã giao"],
    default: "Chờ xác nhận"
  },
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

export default Order;
