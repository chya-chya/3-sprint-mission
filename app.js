import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { PrismaClient } from '@prisma/client';
import productRouter from './routes/product.js'
import articleRouter from './routes/article.js'

const prisma = new PrismaClient();

const app = express();
app.use(express.json());

app.use('/product', productRouter);
app.use('/article', articleRouter);

app.get('/error', (req, res, next) => {
  throw new Error('의도적인 서버 에러 발생!'); // 500 에러 유발
});

app.use((err, req, res, next) => {
  console.log('****************************에러발생!****************************');
  console.log(err);
  res.status(err.status || 500).send('ERROR: ' + err.message);
});

app.use((req, res, next) => {
  res.status(404).send('요청하신 주소를 찾을 수 없습니다.');
});



app.listen(process.env.PORT || 3000, () => console.log('Server Started'));