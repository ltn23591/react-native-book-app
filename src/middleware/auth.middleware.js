const jwt = require('jsonwebtoken');
const userModel = require('../models/user');
const protectRoute = async (req, res, next) => {
    try {
        // Lấy token từ header Authorization
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res
                .status(401)
                .json({ message: 'Không có token, truy cập bị từ chối' });
        }

        // Giải mã token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Tìm người dùng trong cơ sở dữ liệu
        const user = await userModel
            .findById(decoded.userId)
            .select('-password'); // Không trả về mật khẩu
        if (!user) {
            return res
                .status(404)
                .json({ message: 'Người dùng không tồn tại' });
        }

        req.user = user; // Lưu thông tin người dùng vào req.user để sử dụng trong các middleware hoặc route tiếp theo
        next(); // Tiếp tục đến middleware hoặc route tiếp theo
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};

module.exports = {
    protectRoute,
};
