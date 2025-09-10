import cron from "node-cron";
import Products from "../models/product.js";
import Promotion from "../models/promotions.js";
const removeExpiredPromotions = async () => {
  try {
    const currentDate = new Date();
    const expiredPromotions = await Promotion.deleteMany({
      endDate: { $lt: currentDate },
    });

    console.log(`Đã xóa ${expiredPromotions.deletedCount} khuyến mãi hết hạn.`);
  } catch (error) {
    console.error("Lỗi khi xóa khuyến mãi hết hạn:", error);
  }
};
const updateProductDiscount = async () => {
  try {
    const currentDate = new Date();
    const products = await Products.find();

    let totalUpdated = 0;

    for (const product of products) {
      let isModified = false;

      for (const rom of product.roms) {
        if (rom.isDiscount && rom.discountEndDate && new Date(rom.discountEndDate) < currentDate) {
          rom.isDiscount = false;
          rom.discountPrice = null;
          rom.discountPercent = null;
          rom.discountEndDate = null;
          isModified = true;
          totalUpdated++;
        }
      }

      if (isModified) {
        await product.save();
      }
    }

    console.log(`${totalUpdated} biến thể ROM đã được cập nhật khuyến mãi.`);
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm hết hạn khuyến mãi:", error);
  }
};
cron.schedule('0 0 * * *', async () => {
  console.log("Chạy cron job để xóa khuyến mãi hết hạn...");
  await removeExpiredPromotions();  
  await updateProductDiscount();   
});
