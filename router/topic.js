const express = require('express');
const TopicModel = require('../models/topic');
const PostModel = require('../models/post');
const router = express.Router();

function checkDataTopic(req, res, next) {
  const name = req.body.name;
  const slug = req.body.slug;
  if (!name || !slug)
    return res.status(401).json({
      statusCode: 401,
      messageError: 'Data to post could be not found',
    });
  req.name = name;
  req.slug = slug;
  next();
}

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
      const data = await TopicModel.find({
        name: { $regex: '.*' + search + '.*' },
      }).sort({ postNumber: sort });
      return res.json(data);
    }
    const data = await TopicModel.find({}).sort({ postNumber: sort });
    return res.json(data);
  } else {
    limit = Number(limit);
    page = Number(page);
    if (page < 1) page = 1;
    let skip = (page - 1) * limit;

    if (search) {
      const total = await TopicModel.countDocuments({
        name: { $regex: '.*' + search + '.*' },
      });

      const data = await TopicModel.find({
        name: { $regex: '.*' + search + '.*' },
      })
        .skip(skip)
        .limit(limit)
        .sort({ postNumber: sort });
      return res.json({
        pagination: {
          page,
          limit,
          totalRows: total,
        },
        data: data,
      });
    } else {
      const data = await TopicModel.find({})
        .skip(skip)
        .limit(limit)
        .sort({ postNumber: sort });
      const total = await TopicModel.countDocuments({});
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
    const data = await TopicModel.findById(id);
    return res.json(data);
  } catch (error) {
    return res.status(401).json({
      statusCode: 403,
      messageError: 'Can not find any topic with this id',
    });
  }
});

router.post('/', checkDataTopic, async (req, res) => {
  const name = req.name;
  const slug = req.slug;

  const postNumber = await PostModel.countDocuments({ category: name });

  try {
    const data = await TopicModel.create({ name, slug, postNumber });
    return res.json({
      message: 'Thêm chủ đề thành công',
      data,
    });
  } catch (error) {
    return res.status(500).json({
      statusCode: 500,
      messageError: 'Something went wrong',
    });
  }
});

router.put('/:id', checkDataTopic, async (req, res) => {
  const id = req.params.id;
  const name = req.name;
  const slug = req.slug;

  const postNumber = await PostModel.countDocuments({ category: name });

  try {
    const data = await TopicModel.findByIdAndUpdate(id, {
      name,
      slug,
      postNumber,
    });
    if (data) {
      return res.json({
        message: 'Cập nhật chủ đề thành công',
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
    await TopicModel.deleteOne({ _id: id });
    return res.json({
      message: 'Xóa chủ đề thành công',
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
      await TopicModel.deleteOne({ _id: id });
    });

    return res.json({
      message: 'Xóa danh sách chủ đề thành công',
    });
  } catch (error) {
    return res.status(403).json({
      statusCode: 403,
      messageError: 'Something went wrong',
    });
  }
});

module.exports = router;
