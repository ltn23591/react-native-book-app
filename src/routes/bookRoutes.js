const express = require('express');
const {
    addBook,
    getAllBook,
    deleteBook,
    getBooksByUser,
} = require('./../controllers/bookController');
const { protectRoute } = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/', protectRoute, addBook);
router.get('/', protectRoute, getAllBook);
router.get('/user', protectRoute, getBooksByUser);
router.delete('/:id', protectRoute, deleteBook);

module.exports = router;
