import express from "express";
import { Register, Login, Logout } from "../controllers/Users.js";
import { verifyToken } from "../middleware/VerifyToken.js";
import { refreshToken, verifyRefreshToken } from "../controllers/RefreshToken.js";
import { addStatEnrty, getUserStats } from "../controllers/Stats.js";

const router = express.Router();

router.get('/api/users', verifyToken);
router.post('/api/users', Register);
router.post('/api/login', Login);
router.get('/api/auth', verifyRefreshToken);
router.get('/api/token', refreshToken);
router.delete('/api/logout', Logout);
// router.post('/api/stats', addStatEnrty);
// router.get('/api/stats', getUserStats);

export default router;