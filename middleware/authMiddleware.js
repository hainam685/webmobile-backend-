import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Không có token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới được truy cập" });
  }
  next();
};
