const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        caption: { type: String, required: true },
        rating: { type: Number, min: 1, max: 5 },
        image: { type: String, required: true },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Liên kết với mô hình User
            required: true, // Bắt buộc phải có người dùng liên kết
        },
    },
    { timestamps: true }, // Tự động thêm trường createdAt và updatedAt
);

const Book = mongoose.model('Book', bookSchema);
module.exports = Book;
