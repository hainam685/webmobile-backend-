import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import authRoutes from "./routes/authRouter.js";
import userRoutes from "./routes/userRouter.js";
import routes from "./routes/router.js";
import "./middleware/cron.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

mongoose.connect('mongodb+srv://nam444345_db_user:hainam2003@cluster0.yyx0th4.mongodb.net/webmobile')
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    res.status(500).json({ message: 'Không thể kết nối đến cơ sở dữ liệu' });
  });

// Middleware
app.use(cors({
  origin: "https://webmobile-frontend-3dxk6si0c-hainam685s-projects.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// Routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/api", routes);

app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Khởi động server
app.listen(PORT, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});
