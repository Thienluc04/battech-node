const express = require('express');
const router = express.Router();
const nodeMailer = require('nodemailer');
const AccountModel = require('../models/account');

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

    if (info) {
      return res.json({
        message: 'Đã gửi mã xác nhận về email của bạn',
        data: email,
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

function randomPass(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}

router.post('/check-code', async (req, res) => {
  const code = req.body.code;
  const email = req.body.email;
  if (!code || !email) return res.sendStatus(401);
  if (code == randomCode) {
    const password = randomPass(8);
    await AccountModel.findOneAndUpdate(
      { email },
      {
        password,
      }
    );
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
      subject: 'Mật khẩu mới',
      html: `<h1>Mật khẩu mới của bạn là:</h1>
              <h2>${password}</h2>`,
    });

    if (info) {
      return res.json({
        message: 'Mật khẩu mới đã được gửi về email của bạn',
      });
    } else {
      return res.status(500).json({
        messageError: 'Something went wrong',
      });
    }
  } else {
    res.status(403).json({
      messageError: 'Mã xác nhận không trùng khớp',
    });
  }
});

module.exports = router;
