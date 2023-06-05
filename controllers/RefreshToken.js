import prisma from '../prisma.js'
import jwt from 'jsonwebtoken';

// actually there's no point in two of those functions in a time, bcuz' obviously they are the same
// but also i don't remember why i wrote two of them, so at this point i'm afraid to remove one of them

export const refreshToken = async (req, res) => {
	// don't even ask why it's all in try block

	try {
		// take refresh token from user's cookies
		const refreshToken = req.universalCookies.get('refreshToken');
		console.log(refreshToken);

		// check if refresh token exists
		if (!refreshToken) return res.sendStatus(401);

		// check if there's user with this refresh token
		const user = await prisma.users.findFirst({
			where: {
				refresh_token: refreshToken
			}
		});
		if (!user) return res.sendStatus(403);

		// verifying refresh token
		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
			if (err) return res.sendStatus(403);
			const { id, name, login } = user;
			const accessToken = jwt.sign({ id, name, login }, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: '15s'
			});
			res.json({ accessToken });
		});
	} catch (error) {
		console.log(error);
	}
}

export const verifyRefreshToken = async (req, res) => {
	// don't even ask why it's all in try block

	try {
		// take refresh token from user's cookies
		const refreshToken = req.headers['refreshToken'];

		// check if refresh token exists
		if (!refreshToken) return res.sendStatus(401);

		// check if there's user with this refresh token
		const user = await prisma.users.findFirst({
			where: {
				refresh_token: refreshToken
			}
		});
		if (!user) res.sendStatus(403);

		jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
			if (err) return res.sendStatus(403);
			const { id, name, login } = user;
			const accessToken = jwt.sign({ id, name, login }, process.env.ACCESS_TOKEN_SECRET, {
				expiresIn: '15s'
			});
			res.json({ accessToken });
		})
	} catch (error) {
		console.log(error);
	}
}
