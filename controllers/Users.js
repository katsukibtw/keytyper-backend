import prisma from '../prisma.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
	// taking data from request
	const { name, login, pass, confPass } = req.body;

	// check if user exists
	const ifuser = await prisma.users.findFirst({
		where: {
			login: login
		}
	})
	if (ifuser) return res.status(400).json({ msg: "Этот логин уже занят!" });
	if (pass !== confPass) return res.status(400).json({ msg: "Пароли не совпадают!" });

	// hashing password
	const salt = await bcrypt.genSalt();
	const hashPass = await bcrypt.hash(pass, salt);

	// creating user's record in db
	try {
		await prisma.users.create({
			data: {
				login: login,
				pass: hashPass,
				name: name
			}
		});
		res.json({ msg: "success" });
	} catch (e) {
		console.log(e);
	}
}

export const login = async (req, res) => {
	// don't ask why it's all in try block
	try {
		// taking users info from db
		const user = await prisma.users.findFirst({
			where: {
				login: req.body.login
			}
		});

		// check if entered password mathes recorded one
		const match = bcrypt.compare(req.body.pass, user.pass);
		if (!match) return res.status(400).json({ msg: "Неверный логин или пароль" });

		const { id, name, login } = user;

		// creating jwt's
		const accessToken = jwt.sign({ id, name, login }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '15s'
		});
		const refreshToken = jwt.sign({ id, name, login }, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: '1d'
		});

		// update user's refresh token in db
		await prisma.users.update({
			where: {
				id: id
			},
			data: {
				refresh_token: refreshToken
			}
		});
		req.universalCookies.set('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'none',
			secure: false,
			path: '/',
			maxAge: 24 * 60 * 60 * 1000
		});
		res.json({ accessToken, refreshToken, name, id });
	} catch (e) {
		res.status(404).json({ msg: "Пользователя с таким логином не существует" });
		console.log(error.responce);
	}
}

export const logout = async (req, res) => {
	// check if user has refresh token in cookies
	const refreshToken = req.universalCookies.get('refreshToken');
	if (!refreshToken) return res.sendStatus(204);

	// check if user has refresh token in db
	const user = await prisma.users.findFirst({
		where: {
			refresh_token: refreshToken
		}
	});

	if (!user) return res.sendStatus(204);

	// removing user's refresh token from db
	await prisma.users.update({
		where: {
			id: user.id
		},
		data: {
			refresh_token: null
		}
	});

	// remove client's cookie
	req.universalCookies.remove('refreshToken');
	return res.sendStatus(200);
}
