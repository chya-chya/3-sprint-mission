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
const prodCommentRouter = express.Router();

prodCommentRouter.get('/all', async (req, res, next) => {
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

prodCommentRouter.get('', async (req, res, next) => {
  const comment = await prisma.prodComment.findMany({
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
});

prodCommentRouter.get('/:cursor', async (req, res, next) => {
  const { cursor } = req.params;
  const comment = await prisma.prodComment.findMany({
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


prodCommentRouter.post('', async (req, res, next) => {
  const commnt = await prisma.prodComment.create({
    data: req.body,
  });
  res.send(commnt);
});

prodCommentRouter.patch('/:id', async (req, res, next) =>{
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
});

prodCommentRouter.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  await prisma.prodComment.delete({
     where: { id: parseInt(id) },
  });
  res.sendStatus(204);
});

export default prodCommentRouter;