const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.in",
     port: 465,
     secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"i-Trends" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  };
  console.log(mailOptions);

  const info = await transporter.sendMail(mailOptions);
  console.log(info);

};

module.exports = sendEmail;
