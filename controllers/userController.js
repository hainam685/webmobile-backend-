import User from "../models/user.js";
import bcrypt from "bcryptjs";

export const getUser = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error.message);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

export const addUser = async (req, res) => {
    try {
        const { email, password, address, numberPhone, fullName, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            email,
            password: hashedPassword,
            address,
            numberPhone,
            fullName,
            role,
        });

        const user = await newUser.save();

        res.status(201).json(user);
    } catch (error) {
        console.error("Lỗi khi thêm tài khoản:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted' });
    } catch (error) {
        next(error);
    }
};

export const updateUser = async (req, res) => {
    try {
        const updatedFields = { ...req.body };

        if (updatedFields.password) {
            const hashedPassword = await bcrypt.hash(updatedFields.password, 10);
            updatedFields.password = hashedPassword;
        } else {
            delete updatedFields.password;
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updatedFields,
            { new: true }
        );

        const result = updatedUser.toObject();
        delete result.password;

        res.status(200).json(result);
    } catch (error) {
        console.error("Lỗi khi cập nhật user:", error.message);
        res.status(500).json({ message: "Lỗi server", error: error.message });
    }
};

export const lockUser = async (req, res) => {
    const { isLocked } = req.body;
    try {
        await User.findByIdAndUpdate(req.params.id, { isLocked });
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};

export const changeRole = async (req, res) => {
    const { role } = req.body;
    try {
        await User.findByIdAndUpdate(req.params.id, { role });
        res.json({ message: 'Cập nhật quyền thành công' });
    } catch (error) {
        res.status(500).json({ error: 'Lỗi server' });
    }
};



