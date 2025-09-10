import mongoose from "mongoose";

const promotionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  discountPercent: { type: Number, required: true },
  applicableCategories: [{ type: String, required: true }],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
});

const Promotion = mongoose.model('Promotion', promotionSchema);
export default Promotion;
