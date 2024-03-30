import { config } from 'dotenv';
import { buildApp } from './app';

config();
console.log('start');
console.log(process.env.TABLE_NAME);

const app = buildApp();

const port = process.env.PORT || 3000;
app.listen(3000, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
