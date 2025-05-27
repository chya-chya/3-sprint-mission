import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { assert, StructError } from 'superstruct';
import { 
  CreateProduct,
  PatchProduct,
  CreateArticle,
  PatchArticle 
} from './structs.js';
import { skip } from '@prisma/client/runtime/library';


const prisma = new PrismaClient();

const app = express();
app.use(express.json());


app.get('/product/:id', async (req, res, next) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
     where: { id }
  });
  if (!product) {
    const err = new Error('ID를 찾을 수 없습니다.');
    err.status = 404;
    return next(err);
  };
  res.send(product);
});

app.get('/product', async (req, res, next) => {
  const { offset = 0, limit = 10, sort = 'recent', search = ''} = req.query;
  let orderBy;
  switch(sort) {
    case 'recent':
      orderBy = { createdAt: 'desc' };
      break;
    case 'former':
      orderBy = { createdAt: 'asc' };
      break;
    default:
      orderBy = { createdAt: 'desc'};
  }
  const product = await prisma.product.findMany({
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
    where: {
      OR: [
        { name: { contains: search }},
        { description: { contains: search }},
      ],
    },
  });
    if (product.length === 0) { // 에러 반환을 해야하나?
      res.send({ message : '검색된 제품이 없습니다.'});
  };
  res.send(product);
});

app.post('/product', async (req, res, next) => {
  try {
    assert(req.body, CreateProduct);
    const product = await prisma.product.create({
      data: req.body,
    });
    res.send(product);
  } catch (err) {
    if (err instanceof StructError) {
      console.log('****************************StructError 발생!****************************');
      return next(err);
    }
    next(err);
  }
});

app.patch('/product/:id', async (req, res, next) =>{
  try {
    assert(req.body, PatchProduct);
    const { id } = req.params;
    const product = await prisma.product.update({
      where: { id },
      data: req.body,
    });
      if (!product) {
      const err = new Error('ID를 찾을 수 없습니다.');
      err.status = 404;
      return next(err);
    };
    res.send(product);
  } catch (err) {
    if (err instanceof StructError) {
      console.log('****************************StructError 발생!****************************');
      return next(err);
    }
    next(err);
  }
});

app.delete('/product/:id', async (req, res, next) => {
  const { id } = req.params;
  await prisma.product.delete({
     where: { id },
  });
  res.sendStatus(204);
});

app.get('/error', (req, res, next) => {
  throw new Error('의도적인 서버 에러 발생!'); // 500 에러 유발
});


// -----------------------  Article ------------------------------
app.get('/article/:id', async (req, res, next) => {
  const { id } = req.params;
  const article = await prisma.article.findUnique({
     where: { id }
  });
  if (!article) {
    const err = new Error('ID를 찾을 수 없습니다.');
    err.status = 404;
    return next(err);
  };
  res.send(article);
});

app.get('/article', async (req, res, next) => {
  const { offset = 0, limit = 10, sort = 'recent', search = ''} = req.query;
  let orderBy;
  switch(sort) {
    case 'recent':
      orderBy = { createdAt: 'desc' };
      break;
    case 'former':
      orderBy = { createdAt: 'asc' };
      break;
    default:
      orderBy = { createdAt: 'desc'};
  }
  const article = await prisma.article.findMany({
    orderBy,
    skip: parseInt(offset),
    take: parseInt(limit),
    where: {
      OR: [
        { title: { contains: search }},
        { content: { contains: search }},
      ],
    },
  });
  if (article.length === 0) {
      res.send({ message : '검색된 게시글이 없습니다.'});
  };
  res.send(article);
});

app.post('/article', async (req, res, next) => {
  try {
    assert(req.body, CreateArticle);
    const article = await prisma.article.create({
      data: req.body,
    });
    res.send(article);
  } catch (err) {
      if (err instanceof StructError) {
        console.log('****************************StructError 발생!****************************');
        return next(err);
      }
      next(err);
  }
});

app.patch('/article/:id', async (req, res, next) =>{
  try {
    assert(req.body, PatchArticle);
    const { id } = req.params;
    const article = await prisma.article.update({
      where: { id },
      data: req.body,
    });
      if (!article) {
      const err = new Error('ID를 찾을 수 없습니다.');
      err.status = 404;
      return next(err);
    };
    res.send(article);
  } catch (err) {
    if (err instanceof StructError) {
        console.log('****************************StructError 발생!****************************');
        return next(err);
      }
      next(err);
  }
});

app.delete('/article/:id', async (req, res, next) => {
  const { id } = req.params;
  await prisma.article.delete({
     where: { id },
  });
  res.sendStatus(204);
});

app.use((err, req, res, next) => {
  console.log('****************************에러발생!****************************');
  console.log(err);
  res.status(err.status || 500).send('ERROR: ' + err.message);
});




app.listen(process.env.PORT || 3000, () => console.log('Server Started'));