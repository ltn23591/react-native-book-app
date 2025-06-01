const { CronJob } = require('cron');
const https = require('https');

const job = new CronJob('*/14 * * * *', function () {
    https
        .get(process.env.API_URL, (res) => {
            if (res.statusCode === 200) {
                console.log('Cron job executed successfully at ' + new Date());
            } else {
                console.error('Error executing cron job: ' + res.statusCode);
            }
        })
        .on('error', (err) => {
            console.error('Error executing cron job:', err);
        });
});

module.exports = job;

/**
 * Giữ ứng dụng hoạt động liên tục (wake-up ping):
Nhiều hosting (như Render free) sẽ tạm dừng app nếu không có request sau một thời gian.
Cron job này sẽ "đánh thức" app bằng cách tự gọi vào chính URL app định kỳ.
Theo dõi uptime hoặc kiểm tra server có sập không. */
