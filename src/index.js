const express = require('express');
const dotenv = require('dotenv/config');
const authRoutes = require('./routes/authRoutes');
const bookRoutes = require('./routes/bookRoutes');
const connectDB = require('./config/db');
const cors = require('cors');
const job = require('./config/cron');
const app = express();
const port = process.env.PORT || 3000;
job.start(); // Bắt đầu cron job
app.use(cors()); // Cấu hình CORS để cho phép tất cả các nguồn gốc truy cập
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/auth', authRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
    connectDB();
});
