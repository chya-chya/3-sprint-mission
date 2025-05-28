import express from 'express';
import { assert, StructError } from 'superstruct';
import { PrismaClient } from '@prisma/client';
import { 
  CreateArticle,
  PatchArticle 
} from '../structs.js';
import { skip } from '@prisma/client/runtime/library';

const app = express();
const prisma = new PrismaClient();
const artiCommentRouter = express.Router();



artiCommentRouter.route('/artiComment')
  .get(async (req, res, next) => {
    const comment = await prisma.ArtiComment.findMany({
      take: 3,
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
  })
  .post(async (req, res, next) => {
    const artiComment = await prisma.ArtiComment.create({
      data: req.body,
    });
    res.send(artiComment);
  });

artiCommentRouter.route('/artiComment/:id')
  .patch(async (req, res, next) =>{
    const { id } = req.params;
    const commnt = await prisma.ArtiComment.update({
      where: { id: parseInt(id) },
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
    await prisma.ArtiComment.delete({
      where: { id : parseInt(id) },
    });
    res.sendStatus(204);
  });

  artiCommentRouter.get('/artiComment/all', async (req, res, next) => {
  const comment = await prisma.ArtiComment.findMany({
    select: {
    id: true, 
    content: true,
    createdAt: true,
    updatedAt: false,
    },
  });
  res.send(comment);
});

artiCommentRouter.get('/artiComment/:cursor', async (req, res, next) => {
  const { cursor } = req.params;
  const comment = await prisma.ArtiComment.findMany({
    take: 3,
    skip: 1,
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



export default artiCommentRouter;