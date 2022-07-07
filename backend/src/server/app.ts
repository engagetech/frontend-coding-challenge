import express from 'express';
import cors from 'cors';
import { data } from '../data';

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/application/labourstats', async (req, res, next) => {
  res.status(200).json(data);
});

export default app;
