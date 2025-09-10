import express from "express";
import { verifyToken, requireAdmin } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/admin/dashboard", verifyToken, requireAdmin, (req, res) => {
  res.json({ message: "Chào mừng admin" });
});
export default router;
