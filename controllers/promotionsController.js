import promotions from "../models/promotions.js";
import Product from "../models/product.js";

export const createPromotion = async (req, res) => {
  try {
    const { name, discountPercent, applicableCategories, startDate, endDate } = req.body;

    if (isNaN(discountPercent) || discountPercent <= 0 || discountPercent > 100) {
      return res.status(400).json({ message: "Giảm giá phải là một số hợp lệ trong phạm vi từ 1 đến 100!" });
    }

    const promotion = new promotions({
      name,
      discountPercent,
      applicableCategories,
      startDate,
      endDate,
    });

    const savedPromo = await promotion.save();

    await Promise.all(applicableCategories.map(async (category) => {
      const productsInCategory = await Product.find({ category });

      await Promise.all(productsInCategory.map(async (product) => {
        const updatedRoms = product.roms.map((rom) => {
          const discountAmount = rom.price * (discountPercent / 100);
          return {
            ...rom.toObject(),
            isDiscount: true,
            discountPercent,
            discountPrice: discountAmount,
            discountEndDate: endDate,
          };
        });

        product.roms = updatedRoms;
        await product.save();
      }));
    }));

    res.status(201).json(savedPromo);
  } catch (err) {
    console.error("Lỗi khi tạo chương trình khuyến mãi:", err);
    res.status(500).json({ message: "Lỗi khi tạo khuyến mãi" });
  }
};

export const getAllPromotions = async (req, res) => {
  try {
    const promotion = await promotions.find().sort({ createdAt: -1 });
    res.status(200).json({ promotion });
  } catch (error) {
    res.status(500).json({ success: false, message: "Lỗi server", error: error.message });
  }
};
