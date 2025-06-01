const express = require('express');
const dotenv = require('dotenv/config');
const authRoutes = require('./src/routes/authRoutes');
const bookRoutes = require('./src/routes/bookRoutes');
const connectDB = require('./src/config/db');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors()); // Cấu hình CORS để cho phép tất cả các nguồn gốc truy cập
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    connectDB();
});
