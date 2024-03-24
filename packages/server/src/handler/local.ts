import { buildApp } from './app';

// config();

const app = buildApp();

const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
