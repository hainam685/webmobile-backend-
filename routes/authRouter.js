import express from "express";
import { register,login,getUser, adminLogin } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/user", getUser);
router.post("/admin-login", adminLogin);

export default router;