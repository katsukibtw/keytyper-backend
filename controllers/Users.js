import Users from '../models/UserModels.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';

export const getUsers = async (req, res) => {
	try {
		const users = await Users.findAll({
			attributes: ['id', 'login', 'name']
		});
		res.json(users);
	} catch (error) {
		console.log(error);
	}
}

export const Register = async (req, res) => {
	const { name, login, pass, confPass } = req.body;
	const findUser = Users.findAll({
		where: {
			login: login
		}
	}).then((result) => result[0]);
	if (findUser) return res.status(400).json({ msg: "Этот логин уже занят!" });
	if (pass !== confPass) return res.status(400).json({ msg: "Пароли не совпадают!" });
	const salt = await bcrypt.genSalt();
	const hashPass = await bcrypt.hash(pass, salt);
	try {
		await Users.create({
			login: login,
			pass: hashPass,
			name: name,
		});
		res.json({ msg: "success" });
	} catch (error) {
		console.log(error);
	}
}

export const Login = async (req, res) => {
	try {
		const user = await Users.findAll({
			where: {
				login: req.body.login
			}
		}).then((res) => { return res[0] });
		const match = await bcrypt.compare(req.body.pass, user.dataValues.pass);
		if (!match) return res.status(400).json({ msg: "Неверный логин или пароль" });
		const userId = user.dataValues.id;
		const name = user.dataValues.name;
		const login = user.dataValues.login;
		const accessToken = jwt.sign({ userId, name, login }, process.env.ACCESS_TOKEN_SECRET, {
			expiresIn: '15s'
		})
		const refreshToken = jwt.sign({ userId, name, login }, process.env.REFRESH_TOKEN_SECRET, {
			expiresIn: '1d'
		})

		await Users.update({ refresh_token: refreshToken }, {
			where: {
				id: userId
			}
		});
		res.cookie('refreshToken', refreshToken, {
			httpOnly: true,
			sameSite: 'none',
			secure: true,
			maxAge: 24 * 60 * 60 * 1000
		});
		res.json({ accessToken, refreshToken, name, userId });
	} catch (error) {
		res.status(404).json({ msg: "Пользователя с таким логином не существует" });
	}
}

export const Logout = async (req, res) => {
	const refreshToken = req.cookies.refreshToken;
	if (!refreshToken) return res.sendStatus(204);
	const user = await Users.findAll({
		where: {
			refresh_token: refreshToken
		}
	}).then((res) => res);
	if (!user[0]) return res.sendStatus(204);
	const userId = user[0].id;
	await Users.update({ refresh_token: null }, {
		where: {
			id: userId
		}
	});
	res.clearCookie('refreshToken');
	return res.sendStatus(200);
}
