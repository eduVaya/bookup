import express from 'express';
import { signup } from '../controllers/authenticationContrillers.js'

const router = express.Router();

router.post('/signup', signup);

export default router;
