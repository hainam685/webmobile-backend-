import Comment from "../models/comment.js";
import Order from "../models/order.js";

export const createComment = async (req, res) => {
  try {
    const { productId, content, rating, color, rom, username , email, productname} = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({
      userId,
      'items.productId': productId
    });

    if (!order) {
      return res.status(403).json({ message: 'Bạn chưa mua sản phẩm này.' });
    }

    const comment = new Comment({
      productId,
      userId,
      username,
      email,
      content,
      rating,
      productname,
      color,
      rom
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo bình luận', error: error.message });
  }
};


export const getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const comments = await Comment.find({ productId }).populate('userId', 'fullName');

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận', error: error.message });
  }
};

export const getCommentsGroupedByUser = async (req, res) => {
  try {
    const groupedComments = await Comment.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $group: {
          _id: "$userId",
          user: { $first: "$user" },
          comments: {
            $push: {
              _id: "$_id",
              content: "$content",
              rating: "$rating",
              status: "$status",
              createdAt: "$createdAt",
              product: {
                _id: "$product._id",
                name: "$product.name"
              },
              color: "$color",
              rom: "$rom"
            }
          }
        }
      }
    ]);

    // Chuyển mảng thành object theo userId
    const result = {};
    groupedComments.forEach(item => {
      result[item._id.toString()] = {
        user: {
          fullName: item.user.fullName,
          email: item.user.email,
        },
        comments: item.comments
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy bình luận theo user', error: error.message });
  }
};


export const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    const comment = await Comment.findByIdAndDelete(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Không tìm thấy bình luận để xóa' });
    }

    res.json({ message: 'Xóa bình luận thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa bình luận', error: error.message });
  }
};
