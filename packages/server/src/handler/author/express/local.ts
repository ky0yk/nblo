import { config } from 'dotenv';
import { buildApp } from './app';

config();

const app = buildApp();

const port = process.env.AUTOR_PORT || 3000;
app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
