const express = require('express');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const AccountModel = require('../models/account');
const router = express.Router();

dotenv.config();

function verifyToken(req, res, next) {
  const authHeader = req.header('Authorization');

  const token = authHeader && authHeader.split(' ')[1];

  if (!token)
    return res.status(401).json({
      messageError: 'Unauthorized',
    });
  try {
    const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.id = decode.id;
    next();
  } catch (error) {
    return res.status(403).json({
      messageError: 'Forbidden',
    });
  }
}

function generateToken(payload) {
  const { id } = payload;
  const accessToken = jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET);
  const refreshToken = jwt.sign({ id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '24h',
  });

  return { accessToken, refreshToken };
}

async function updateRefreshToken(id, refreshToken) {
  const user = await AccountModel.findById(id);
  await AccountModel.findByIdAndUpdate(id, {
    username: user.username,
    password: user.password,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    refreshToken,
  });
}

router.post('/login', async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const userExist = await AccountModel.findOne({ email });
  if (!userExist)
    return res.status(403).json({
      messageError: 'Email này không tồn tại',
    });

  const user = await AccountModel.findOne({ email, password });
  if (user) {
    const tokens = generateToken({ id: user.id });
    updateRefreshToken(user.id, tokens.refreshToken);
    res.json(tokens);
  } else {
    res.status(403).json({
      messageError: 'Mật khẩu nhập vào không chính xác',
    });
  }
});

router.get('/me', verifyToken, async (req, res) => {
  const id = req.id;
  const user = await AccountModel.findById(id);
  if (!user) return res.sendStatus(401);
  res.json(user);
});

router.post('/token', async (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) return res.sendStatus(401);
  const user = await AccountModel.findOne({ refreshToken });
  if (!user) return res.sendStatus(403);
  try {
    const tokens = generateToken({ id: user.id });
    updateRefreshToken(user.id, tokens.refreshToken);
    res.json(tokens);
  } catch (error) {
    res.sendStatus(403);
  }
});

module.exports = router;
