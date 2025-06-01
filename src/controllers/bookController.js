const cloudinary = require('../config/cloudinary');
const Book = require('../models/book');
const addBook = async (req, res) => {
    try {
        const { title, caption, rating, image } = req.body;

        if (!title || !caption || !rating || !image) {
            return res
                .status(400)
                .json({ message: 'Vui lòng nhập đầy đủ thông tin' });
        }

        // Tải hình ảnh lên Cloudinary
        const upLoadResponse = await cloudinary.uploader.upload(image);
        const imageUrl = upLoadResponse.secure_url;
        // Lưu vào cơ sở dữ liệu
        const newBook = new Book({
            title,
            caption,
            rating,
            image: imageUrl, // Lưu URL hình ảnh từ Cloudinary
            user: req.user._id, // Lấy ID người dùng từ token đã xác thực
        });
        await newBook.save();
        res.status(201).json({
            message: 'Thêm sách thành công',
            newBook,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
const getAllBook = async (req, res) => {
    try {
        const page = req.query.page || 1; // Lấy số trang từ query, mặc định là trang 1
        const limit = req.query.limit || 5; // Lấy số lượng sách mỗi trang từ query, mặc định là 5
        const skip = (page - 1) * limit; // Tính số lượng sách cần bỏ qua
        const books = await Book.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('user', 'username profileImage'); // Liên kết với mô hình User để lấy thông tin người dùng

        const totalBooks = await Book.countDocuments(); // Đếm tổng số sách

        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks / limit), // Tính tổng số trang
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
const deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Sách không tồn tại' });
        }

        // Kiểm tra người dùng có phải là người đã tạo sách này không
        if (book.user.toString() !== req.user._id.toString()) {
            return res
                .status(403)
                .json({ message: 'Bạn không có quyền xóa sách này' });
        }
        await Book.deleteOne();

        // Xóa hinh ảnh khỏi Cloudinary
        if (book.image && book.image.includes('cloudinary')) {
            try {
                const publicId = book.image.split('/').pop().split('.')[0]; // Lấy public ID từ URL
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log(
                    'Lỗi khi xóa hình ảnh khỏi Cloudinary:',
                    deleteError,
                );
            }
        }
        res.json({ message: 'Xóa sách thành công' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi máy chủ' });
    }
};
module.exports = {
    addBook,
    getAllBook,
    deleteBook,
};
