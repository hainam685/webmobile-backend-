import Order from "../models/order.js";

export const getOrdersByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const orders = await Order.find({ userId })
      .populate("items.productId", "name price");

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng của người dùng", error });
  }
};

export const getOrdersGroupedByUser = async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'email fullName');

    const grouped = {};
    orders.forEach(order => {
      const userKey = order.userId._id;
      if (!grouped[userKey]) {
        grouped[userKey] = {
          user: order.userId,
          orders: [],
        };
      }
      grouped[userKey].orders.push(order);
    });

    res.status(200).json(grouped);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi khi lấy đơn hàng theo user" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { orderStatus } = req.body;

    const allowedStatuses = ["Chờ xác nhận", "Đang giao", "Đã giao"];
    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!updatedOrder) return res.status(404).json({ message: "Không tìm thấy đơn hàng" });

    res.json({ message: "Cập nhật trạng thái thành công", order: updatedOrder });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


