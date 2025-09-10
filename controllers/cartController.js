import Cart from "../models/cart.js";

export const getCart = async (req, res) => {
    try {
      const userId = req.user.id;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(200).json({ cart: null });
      }
      res.status(200).json({ cart });
    } catch (err) {
      console.error("Lỗi khi lấy giỏ hàng:", err);
      res.status(500).json({ error: "Lỗi server khi lấy giỏ hàng" });
    }
  };

export const saveCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, totalAmount, userInfo } = req.body;

    if (!userInfo.fullName || !userInfo.address || !userInfo.numberPhone || !userInfo.email) {
      return res.status(400).json({ error: "Vui lòng cập nhật đầy đủ thông tin tài khoản." });
    }

    let cart = await Cart.findOne({ userId });

    if (cart) {
      cart.items = items;
      cart.totalAmount = totalAmount;
      cart.userInfo = userInfo;
      await cart.save();
    } else {
      cart = new Cart({
        userId,
        items,
        totalAmount,
        userInfo
      });
      await cart.save();
    }

    res.status(200).json({ message: "Giỏ hàng đã được lưu thành công", cart });

  } catch (error) {
    console.error("Lỗi khi lưu giỏ hàng:", error);
    res.status(500).json({ error: "Lỗi server khi lưu giỏ hàng" });
  }
};


export const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    const cartData = await Cart.findOne({ userId });
    if (!cartData) {
      return res.status(404).json({ message: "Không tìm thấy giỏ hàng" });
    }

    const updatedItems = cartData.items.filter(item => item.productId.toString() !== productId);
    cartData.items = updatedItems;

    cartData.totalAmount = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    await cartData.save();

    res.status(200).json({ message: "Đã xóa sản phẩm khỏi giỏ hàng", cart: cartData });
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm khỏi giỏ hàng:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi xóa sản phẩm khỏi giỏ hàng" });
  }
};
