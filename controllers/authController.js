import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email đã tồn tại" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      email,
      password: hashedPassword,
      address: "",
      numberPhone: "",
      fullName: ""
    });

    await user.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server" });
  }
};


export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });
    
     if (user.isLocked) {
      return res.status(403).json({ message: "Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên." });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Error during login:", error.message);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Không có token, không thể xác thực" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    res.json(user);
  } catch (error) {
    console.error("Error getting user:", error);
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "Tài khoản không tồn tại" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Mật khẩu không đúng" });

  if (user.role !== 'admin') {
    return res.status(403).json({ message: "Bạn không có quyền truy cập admin" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token, role: user.role });
};



