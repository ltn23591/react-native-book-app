const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema(
    {
        username: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true, minlength: 6 },
        profileImage: { type: String, default: '' },
    },
    { timestamps: true }, // Tự động thêm trường createdAt và updatedAt
);

// so sánh mật khẩu
userSchema.methods.comparePassword = async function (userPassword) {
    return await bcrypt.compare(userPassword, this.password);
};

const userModel = mongoose.model('User', userSchema);
module.exports = userModel;
