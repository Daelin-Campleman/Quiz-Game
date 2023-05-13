import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { Router } from "express";

const pageRouter = Router()

pageRouter.get('/home', function(req, res, next) {
  res.sendFile(__dirname + '/index.html');
});

export default pageRouter;