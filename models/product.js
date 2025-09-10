import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
  color: { type: String, required: true },
  image: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  sold: { type: Number, default: 0 }
});

const romSchema = new mongoose.Schema({
  rom: { type: String, required: true },
  price: { type: Number, required: true },
  isDiscount: { type: Boolean, default: false },
  discountPrice: Number,
  discountPercent: Number,
  discountEndDate: Date,
  variants: [variantSchema]
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: String,
  description: { type: String, required: true },
  roms: [romSchema]
});


const Product = mongoose.model("Product", productSchema);

export default Product;
