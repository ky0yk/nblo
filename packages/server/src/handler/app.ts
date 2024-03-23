import express from 'express';
import { buildArticleRouter } from './article/articleRouter';

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.use('/v1/articles', buildArticleRouter());

export default app;
