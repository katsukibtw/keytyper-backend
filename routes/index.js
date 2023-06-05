import express from "express";
import { register, login, logout } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken, verifyRefreshToken } from "../controllers/RefreshToken.js";
import { addStatEnrty, getUserStats, getRoomStats } from "../controllers/Stats.js";

const router = express.Router();

router.get('/api/users', verifyToken);
router.post('/api/users', register);
router.post('/api/login', login);
router.get('/api/auth', verifyRefreshToken);
router.get('/api/token', refreshToken);
router.delete('/api/logout', logout);
router.post('/api/stats', addStatEnrty);
router.get('/api/stats', getUserStats);
router.get('/api/roomstats', getRoomStats);

export default router;
