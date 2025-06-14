const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6 },
        profileImage: { type: String, default: '' },
        isVerified: { type: Boolean, default: false },
        otp: { type: String }, // Lưu mã OTP
        otpExpires: { type: Date }, // Thời gian hết hạn OTP
        resetOTP: {
            type: String,
            default: null,
        },
        resetOTPExpires: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }, // Tự động thêm trường createdAt và updatedAt
);

// so sánh mật khẩu
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
