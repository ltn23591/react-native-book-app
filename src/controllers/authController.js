const userModel = require('../models/user');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { create } = require('../models/book');
const sendMail = require('../middleware/nodemailler');
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

        // Sinh mã OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 phút

        // Tạo người dùng mới
        const newUser = new userModel({
            email,
            username,
            password: hash,
            profileImage: randomAvatar,
            isVerified: false,
            otp,
            otpExpires,
        });

        await newUser.save(); // Lưu người dùng vào cơ sở dữ liệu

        await sendMail({
            to: email,
            subject: 'Xác thực tài khoản',
            text: `Mã xác thực của bạn là: ${otp}`,
        });

        // Tạo token cho người dùng
        // const token = generateToken(newUser._id);
        res.status(201).json({
            message:
                'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.',
            user: {
                _id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                profileImage: newUser.profileImage,
                createdAt: newUser.createdAt,
            },
            // token,
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
        if (!user.isVerified) {
            return res
                .status(400)
                .json({ message: 'Tài khoản chưa xác thực email.' });
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
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    const user = await userModel.findOne({
        email,
        otp,
        otpExpires: { $gt: Date.now() },
    });
    if (!user) {
        return res
            .status(400)
            .json({ message: 'OTP không hợp lệ hoặc đã hết hạn.' });
    }
    user.isVerified = true;
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();
    res.json({ message: 'Xác thực thành công. Bạn có thể đăng nhập.' });
};

// POST /auth/forgot-password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Email không tồn tại' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 số

    // lưu OTP vào DB, hoặc bộ nhớ tạm
    user.resetOTP = otp;
    user.resetOTPExpires = Date.now() + 5 * 60 * 1000; // 5 phút
    await user.save();

    // Gửi email
    await sendMail({
        to: email,
        subject: 'Mã OTP đặt lại mật khẩu',
        text: `Mã OTP của bạn là: ${otp}`,
    });
    res.json({ message: 'OTP đã được gửi về email' });
};

const verytOTP = async (req, res) => {
    const { email, otp } = req.body;
    const user = await userModel.findOne({ email });

    if (!user || user.resetOTP !== otp || user.resetOTPExpires < Date.now()) {
        return res
            .status(400)
            .json({ message: 'OTP không hợp lệ hoặc đã hết hạn' });
    }

    return res.json({ message: 'OTP hợp lệ, tiếp tục đặt lại mật khẩu' });
};

const resetPassword = async (req, res) => {
    const { email, newPassword } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOTP = null;
    user.resetOTPExpires = null;
    await user.save();

    return res.json({ message: 'Đặt lại mật khẩu thành công' });
};

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId; // Lấy từ middleware xác thực JWT

    const user = await userModel.findById(userId);
    if (!user) {
        return res.status(404).json({ message: 'Người dùng không tồn tại' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
        return res
            .status(400)
            .json({ message: 'Mật khẩu hiện tại không đúng' });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: 'Đổi mật khẩu thành công' });
};
module.exports = {
    register,
    login,
    verifyOtp,
    forgotPassword,
    verytOTP,
    resetPassword,
    changePassword,
};
