const express = require('express');
const router = express.Router();
const nodeMailer = require('nodemailer');
const AccountModel = require('../models/account');
const jwt = require('jsonwebtoken');

let randomCode = Math.floor(Math.random() * (9999 - 1000) + 1000);

const html = `
    <h1>Mã code của bạn là:</h1>
    <h2>${randomCode}</h2>
`;

router.post('/check-email', async (req, res) => {
  const email = req.body.email;
  if (!email)
    return res.status(401).json({
      messageError: 'Unauthorized',
    });

  const account = await AccountModel.findOne({ email });

  if (account) {
    const transporter = nodeMailer.createTransport({
      service: 'Gmail',
      auth: {
        user: 'nguyenthienluc2004@gmail.com',
        pass: 'hczc osit veda krfd',
      },
    });

    const info = await transporter.sendMail({
      from: { name: 'Battech', address: 'nguyenthienluc2004@gmail.com' },
      to: email,
      subject: 'Đặt lại mật khẩu',
      html,
    });

    const hashEmail = jwt.sign(email, process.env.RESET_PASS);

    if (info) {
      return res.json({
        message: 'Đã gửi mã xác nhận về email của bạn',
        data: hashEmail,
      });
    } else {
      randomCode = Math.floor(Math.random() * (9999 - 1000) + 1000);
      return res.status(500).json({
        messageError: 'Something went wrong',
      });
    }
  } else {
    randomCode = Math.floor(Math.random() * (9999 - 1000) + 1000);
    return res.status(402).json({
      messageError: 'Email này không tồn tại',
    });
  }
});

router.post('/check-code', async (req, res) => {
  const code = req.body.code;
  const email = req.body.email;
  if (!code || !email) return res.sendStatus(401);
  if (code == randomCode) {
    res.json({
      message: 'Mã xác nhận trùng khớp',
      data: email,
    });
  } else {
    res.status(403).json({
      messageError: 'Mã xác nhận không trùng khớp',
    });
  }
});

router.post('/reset-pass', async (req, res) => {
  const newPass = req.body.newPass;
  const hashEmail = req.body.email;
  if (!newPass) return res.sendStatus(401);
  const email = jwt.verify(hashEmail, process.env.RESET_PASS);
  if (email) {
    try {
      await AccountModel.findOneAndUpdate(
        { email },
        {
          password: newPass,
        }
      );
      res.json({
        message: 'Đã thay đổi mật khẩu. Vui lòng đăng nhập lại !',
      });
    } catch (error) {
      res.status(500).json({
        messageError: 'Something went wrong',
      });
    }
  } else {
    res.status(403).json({
      messageError: 'Không tìm thấy email',
    });
  }
});

module.exports = router;
