const express = require('express');
const TagModel = require('../models/tag');
const router = express.Router();

router.get('/', async (req, res) => {
  let limit = req.query.limit;
  let page = req.query.page;
  const search = req.query.search;
  const sort = req.query.sort;
  if (!sort)
    return res.status(401).json({
      statusCode: 401,
      messageError: 'Data to sort could be not found',
    });

  if (!limit && !page) {
    if (search) {
      const data = await TagModel.find({
        name: { $regex: '.*' + search + '.*' },
      }).sort({ name: sort });
      return res.json(data);
    }
    const data = await TagModel.find({}).sort({ name: sort });
    return res.json(data);
  } else {
    limit = Number(limit);
    page = Number(page);
    if (page < 1) page = 1;
    let skip = (page - 1) * limit;

    if (search) {
      const total = await TagModel.countDocuments({
        name: { $regex: '.*' + search + '.*' },
      });

      const data = await TagModel.find({
        name: { $regex: '.*' + search + '.*' },
      })
        .skip(skip)
        .limit(limit)
        .sort({ name: sort });
      return res.json({
        pagination: {
          page,
          limit,
          totalRows: total,
        },
        data: data,
      });
    } else {
      const data = await TagModel.find({})
        .skip(skip)
        .limit(limit)
        .sort({ name: sort });
      const total = await TagModel.countDocuments({});
      if (data.length > limit) {
        return res.json({
          pagination: {
            page,
            limit,
            totalRows: total,
          },
          data: data,
        });
      } else {
        return res.json({
          pagination: {
            page,
            limit,
            totalRows: total,
          },
          data: data,
        });
      }
    }
  }
});

router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const data = await TagModel.findById(id);
    return res.json(data);
  } catch (error) {
    return res.status(401).json({
      statusCode: 403,
      messageError: 'Can not find any tag with this id',
    });
  }
});

router.post('/', async (req, res) => {
  const name = req.body.name;

  try {
    const data = await TagModel.create({ name });
    return res.json({
      message: 'Thêm tag thành công',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      messageError: 'Something went wrong',
    });
  }
});

router.put('/:id', async (req, res) => {
  const id = req.params.id;
  const name = req.body.name;

  try {
    const data = await TagModel.findByIdAndUpdate(id, {
      name,
    });
    if (data) {
      return res.json({
        message: 'Cập nhật tag thành công',
        data,
      });
    }
  } catch (error) {
    return res.status(403).json({
      statusCode: 403,
      messageError: 'Something went wrong',
    });
  }
});

router.delete('/:id', async (req, res) => {
  const id = req.params.id;

  try {
    await TagModel.deleteOne({ _id: id });
    return res.json({
      message: 'Xóa tag thành công',
    });
  } catch (error) {
    return res.status(403).json({
      statusCode: 403,
      messageError: 'Something went wrong',
    });
  }
});

router.delete('/', async (req, res) => {
  const listId = req.body.listId;
  try {
    listId.forEach(async (id) => {
      await TagModel.deleteOne({ _id: id });
    });

    return res.json({
      message: 'Xóa danh sách tag thành công',
    });
  } catch (error) {
    return res.status(403).json({
      statusCode: 403,
      messageError: 'Something went wrong',
    });
  }
});

module.exports = router;
