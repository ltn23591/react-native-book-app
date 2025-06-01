const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { create } = require('../models/book');
const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET);
};

const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        if (!email || !username || !password) {
            return res
                .status(400)
                .json({ message: 'Vui lòng điền tất cả các trường' });
        }
        if (password.length < 6) {
            return res
                .status(400)
                .json({ message: 'Mật khẩu phải có ít nhất 6 ký tự' });
        }
        if (username.length < 3) {
            return res
                .status(400)
                .json({ message: 'Tên người dùng phải có ít nhất 3 ký tự' });
        }
        // Kiểm tra xem người dùng đã tồn tại chưa
        const existsUser = await userModel.findOne({
            $or: [{ email }, { username }],
        }); //$or: yêu cầu thỏa một trong hai điều kiện
        if (existsUser) {
            return res.status(400).json({
                message:
                    'Người dùng đã tồn tại với email hoặc tên người dùng này',
            });
        }

        // Random ảnh đại diện người dùng
        const randomAvatar = `https://api.dicebear.com/9.x/fun-emoji/svg?seed=${username}`;
        // Mã hóa mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        // Tạo người dùng mới
        const newUser = new userModel({
            email,
            username,
            password: hash,
            profileImage: randomAvatar,
        });

        await newUser.save(); // Lưu người dùng vào cơ sở dữ liệu
        // Tạo token cho người dùng
        const token = generateToken(newUser._id);
        res.status(201).json({
            message: 'Đăng ký thành công',
            user: {
                _id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                profileImage: newUser.profileImage,
            },
            token,
        });
    } catch (error) {
        console.log('Lỗi', error);
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res
                .status(400)
                .json({ message: 'Vui lòng nhập email và mật khẩu' });
        }

        // Kiểm tra người dùng có tồn tại không
        const user = await userModel.findOne({ email });
        if (!user) {
            return res
                .status(400)
                .json({ message: 'Người dùng không tồn tại' });
        }

        // Kiểm tra mật khẩu
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res
                .status(400)
                .json({ message: 'Mật khẩu không chính xác' });
        }
        const token = generateToken(user._id);
        res.status(200).json({
            message: 'Đăng nhập thành công',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                profileImage: user.profileImage,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        console.log('Lỗi', error);
        return res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

module.exports = {
    register,
    login,
};
