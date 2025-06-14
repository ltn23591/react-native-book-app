require('dotenv').config();
const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const oAuth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    'https://developers.google.com/oauthplayground',
);

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

async function sendMail({ to, subject, text, html }) {
    try {
        const accessTokenObj = await oAuth2Client.getAccessToken();
        const accessToken = accessTokenObj?.token || accessTokenObj;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.EMAIL,
                clientId: process.env.CLIENT_ID,
                clientSecret: process.env.CLIENT_SECRET,
                refreshToken: process.env.REFRESH_TOKEN,
                accessToken: accessToken,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to,
            subject,
            text,
            html,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('✅ Mail đã gửi:', result.response);
        return result;
    } catch (error) {
        console.error('❌ Lỗi gửi mail:', error);
        throw error;
    }
}

module.exports = sendMail;
