const express = require('express');
const PostModel = require('../models/post');
const TopicModel = require('../models/topic');
const router = express.Router();

router.get('/', async (req, res) => {
  let limit = req.query.limit;
  let page = req.query.page;
  const search = req.query.search;
  const topic = req.query.topic;
  const sort = req.query.sort;

  if (topic && !limit && !page) {
    if (search) {
      const data = await PostModel.find({
        topic,
        title: { $regex: '.*' + search + '.*' },
      }).sort({ date: sort });
      return res.json(data);
    }
    const data = await PostModel.find({ topic }).sort({ date: sort });
    return res.json(data);
  } else if (limit && page) {
    limit = Number(limit);
    page = Number(page);
    if (page < 1) page = 1;
    let skip = (page - 1) * limit;

    if (topic) {
      if (search) {
        const total = await PostModel.countDocuments({
          topic: topic,
          title: { $regex: '.*' + search + '.*' },
        });

        const data = await PostModel.find({
          topic: topic,
          title: { $regex: '.*' + search + '.*' },
        })
          .skip(skip)
          .limit(limit)
          .sort({ date: sort });

        return res.json({
          pagination: {
            page,
            limit,
            totalRows: total,
          },
          data: data,
        });
      }
      const total = await PostModel.countDocuments({ topic: topic });

      const data = await PostModel.find({ topic: topic })
        .skip(skip)
        .limit(limit)
        .sort({ date: sort });
      return res.json({
        pagination: {
          page,
          limit,
          totalRows: total,
        },
        data: data,
      });
    } else if (search) {
      const total = await PostModel.countDocuments({
        title: { $regex: '.*' + search + '.*' },
      });

      const data = await PostModel.find({
        title: { $regex: '.*' + search + '.*' },
      })
        .skip(skip)
        .limit(limit)
        .sort({ date: sort });

      return res.json({
        pagination: {
          page,
          limit,
          totalRows: total,
        },
        data: data,
      });
    } else {
      const data = await PostModel.find({})
        .skip(skip)
        .limit(limit)
        .sort({ date: sort });
      const total = await PostModel.countDocuments({});

      return res.json({
        pagination: {
          page,
          limit,
          totalRows: total,
        },
        data: data,
      });
    }
  } else {
    const data = await PostModel.find({}).sort({ date: sort });
    return res.json(data);
  }
});

const checkDataPost = (req, res, next) => {
  try {
    const title = req.body.title;
    const description = req.body.description;
    const content = req.body.content;
    const slug = req.body.slug;
    const image = req.body.image;
    const topic = req.body.topic;
    const author = req.body.author;
    const tags = req.body.tags;
    const date = req.body.date;

    if (
      title &&
      description &&
      content &&
      slug &&
      image &&
      topic &&
      author &&
      tags &&
      date
    ) {
      req.data = {
        title,
        description,
        content,
        slug,
        image,
        topic,
        author,
        tags,
        date,
      };
      next();
    } else {
      res.status(500).json({
        messageError: 'You have not entered enough fields',
      });
    }
  } catch (error) {
    res.status(500).json({
      messageError: error.message,
    });
  }
};

router.post('/', checkDataPost, async (req, res) => {
  const topic = req.data.topic;
  const dataTopic = await TopicModel.findOne({ name: topic });

  if (dataTopic) {
    await TopicModel.findByIdAndUpdate(dataTopic.id, {
      postNumber: dataTopic.postNumber + 1,
    });
  }

  await PostModel.create({ ...req.data });

  res.json({
    message: 'Thêm bài viết thành công',
    data: { ...req.data },
  });
});

router.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  const data = await PostModel.findOne({
    slug,
  });
  res.json(data);
});

router.put('/:id', checkDataPost, async (req, res) => {
  const topic = req.data.topic;
  const dataTopic = await TopicModel.findOne({ name: topic });
  const dataPost = await PostModel.findById(req.params.id);

  if (dataTopic) {
    await TopicModel.findByIdAndUpdate(dataTopic.id, {
      postNumber: dataTopic.postNumber + 1,
    });
  }

  if (dataPost) {
    const topicSecond = await TopicModel.findOne({ name: dataPost.topic });

    await TopicModel.findOneAndUpdate(
      { name: dataPost.topic },
      {
        postNumber: topicSecond.postNumber - 1,
      }
    );
  }

  try {
    const id = req.params.id;
    const data = await PostModel.findByIdAndUpdate(id, { ...req.data });

    res.json({
      message: 'Cập nhật bài viết thành công',
      data,
    });
  } catch (error) {
    res.status(500).json({ messageError: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const post = await PostModel.findById(id);

    if (post) {
      const topic = await TopicModel.findOne({ name: post.topic });
      await TopicModel.findByIdAndUpdate(topic.id, {
        postNumber: topic.postNumber - 1,
      });
    }

    await PostModel.deleteOne({ _id: id });

    res.json({
      message: 'Xóa bài viết thành công',
    });
  } catch (error) {
    res.status(500).json({ messageError: error.message });
  }
});

router.delete('/', async (req, res) => {
  const listId = req.body.listId;
  try {
    listId.forEach(async (id) => {
      await PostModel.deleteOne({ _id: id });
    });

    return res.json({
      message: 'Xóa danh sách bài viết thành công',
    });
  } catch (error) {
    return res.status(403).json({
      statusCode: 403,
      messageError: 'Something went wrong',
    });
  }
});

module.exports = router;
