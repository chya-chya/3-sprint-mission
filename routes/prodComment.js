import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const prodCommentRouter = express.Router();

prodCommentRouter.get('/prodComment/all', async (req, res, next) => {
  const comment = await prisma.prodComment.findMany({
    select: {
    id: true, 
    content: true,
    createdAt: true,
    updatedAt: false,
    },
  });
  res.send(comment);
});

prodCommentRouter.route('/prodComment')
  .get(async (req, res, next) => {
    let cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
    const findManyArgs = {
      take: 3,
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true, 
        content: true,
        createdAt: true,
      },
    };
    if (cursor) {
      findManyArgs.cursor = { id: cursor };
      findManyArgs.skip = 1;
    }
    const comments = await prisma.prodComment.findMany(findManyArgs);
    let message
    if(comments[2]) {
      console.log(`다음 커서는 ${comments[2].id}입니다.`);
      message = `다음 커서는 ${comments[2].id}입니다.`;
    } else {
      console.log('다음 커서가 없습니다.')
      message = '다음 커서가 없습니다.';
    }
    res.send({commnts: comments, message: message});
  })
  .post(async (req, res, next) => {
    const commnt = await prisma.prodComment.create({
      data: req.body,
    });
    res.send(commnt);
  });

prodCommentRouter.route('/prodComment/:id')
  .patch(async (req, res, next) =>{
    const { id } = req.params;
    const commnt = await prisma.prodComment.update({
      where: { id: parseInt(id), },
      data: req.body,
    });
      if (!commnt) {
      const err = new Error('ID를 찾을 수 없습니다.');
      err.status = 404;
      return next(err);
    };
    res.send(commnt);
  })
  .delete(async (req, res, next) => {
    const { id } = req.params;
    await prisma.prodComment.delete({
      where: { id: parseInt(id) },
    });
    res.sendStatus(204);
  });

prodCommentRouter.get('/prodComment/:cursor', async (req, res, next) => {
  const { cursor } = req.params;
  const comment = await prisma.prodComment.findMany({
    take: 3,
    cursor: {
      id: parseInt(cursor),
    },
    orderBy: {
      createdAt: 'asc'
    },
    select: {
    id: true, 
    content: true,
    createdAt: true,
    updatedAt: false,
    },
  });
  if(comment[2]) {
    console.log(`다음 커서는 ${comment[2].id + 1}입니다.`);
  } else {
    console.log('마지막 페이지 입니다.')
  }
  res.send(comment);
});








export default prodCommentRouter;