import express from "express";
import dotenv from 'dotenv';
import cookieMiddleware from 'universal-cookie-express';
import cors from 'cors';
import router from "./routes/index.js";
import { Server } from 'socket.io';
import Rooms from './models/RoomsModels.js';
import RoomUsers from './models/RoomUsersModel.js';
import Stats from './models/StatsModels.js';

// socket functions for rooms handling
import { addUser, removeUser, getUser, getUserInRoom, getRoomAdmin } from './utils/roomUsers.js';
import { getRoomLevels, toggleLevel } from "./utils/roomLevelHandler.js";

dotenv.config();
const app = express();
app.use(cookieMiddleware());

// CORS middleware (settings)
var corsMiddleware = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://94.181.190.26'); //replace localhost with actual host
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

	next();
}

const port = process.env.PORT || 5000 // port which server is placed on

app.use(cors({ credentials: true, origin: 'http://94.181.190.26' }));
app.use(corsMiddleware);
app.use(express.json());
app.use(router);

const server = app.listen(port, () => console.log(`Server running at port ${port}`));
const io = new Server(server);

io.on('connection', (socket) => {
	console.log('new connection');

	socket.on('create-room', ({ room_name, admin_name }) => {
		Rooms.findAll({
			where: {
				name: room_name
			}
		}).then((result) => {
			if (result[0]) {
				socket.emit('room already exists');
			} else {
				var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
				var codeLen = 6;
				var code = '';

				for (var i = 0; i < codeLen; i++) {
					var randomNumber = Math.floor(Math.random() * chars.length);
					code += chars.substring(randomNumber, randomNumber + 1);
				}

				Rooms.create({
					name: room_name,
					safe_code: code,
					admin_id: 1,
					level: 1,
				}).then((res) => {
					RoomUsers.create({
						name: admin_name,
						room_id: res.dataValues.id
					}).then((ress) => {
						Rooms.update({ admin_id: ress.dataValues.id }, {
							where: {
								id: ress.dataValues.room_id
							}
						})
					});

					const { error, user } = addUser({ id: socket.id, username: admin_name, room: room_name, room_id: res.dataValues.id, isAdmin: true });
					if (error) {
						socket.emit('failed to join', { error });
					}
					socket.join(user.room);

					io.to(user.room).emit("roomData", {
						room: user.room,
						users: getUserInRoom(user.room),
						admin: getRoomAdmin(user.room)[0].username,
					});

					socket.emit('room created', { safe_code: code });
				});
			}
		});
	});

	socket.on('check if room exists', ({ safe_code }) => {
		Rooms.findAll({
			where: {
				safe_code: safe_code
			}
		}).then((res) => {
			if (res[0]) {
				socket.emit('room exists', { safe_code });
			} else {
				socket.emit('room not exist');
			}
		})
	});

	socket.on('join', ({ safe_code, username }) => {
		Rooms.findAll({
			where: {
				safe_code: safe_code
			}
		}).then((res) => {
			if (res[0]) {
				RoomUsers.findAll({
					where: {
						name: username,
						room_id: res[0].dataValues.id
					}
				}).then((result) => {
					var isadm = false;
					if (!result[0]) {
						RoomUsers.create({
							name: username,
							room_id: res[0].dataValues.id
						})
					} else if (res[0].dataValues.admin_id === result[0].dataValues.id) {
						isadm = true;
					}

					const { error, user } = addUser({ id: socket.id, username: username, room: res[0].dataValues.name, room_id: res[0].dataValues.id, isAdmin: isadm });
					if (error) {
						socket.emit('failed to join', ({ error }));
					} else {
						socket.join(user.room);
					}

					if (!getRoomAdmin(user.room)[0]) {
						socket.emit('failed to join', { error: 'empty data' });
					} else {
						io.to(user.room).emit("roomData", {
							room: user.room,
							room_id: user.room_id,
							admin: getRoomAdmin(user.room)[0].username,
							users: getUserInRoom(user.room),
						});
						// io.to(user.room).emit('roomAdmin', { admin: room_admin[0].username });

						socket.emit('joined', { room_name: res[0].dataValues.name, safe_code: res[0].dataValues.safe_code, username: user.username, room_id: user.room_id });
					}
				});
			}
		})
	})

	socket.on('get room data', ({ room }) => {
		if (!getRoomAdmin(room)[0]) {
			socket.emit('failed to join', { error: 'empty data' });
		} else {
			io.to(room).emit('roomData', {
				room: room,
				room_id: getRoomAdmin(room)[0].room_id,
				users: getUserInRoom(room),
				admin: getRoomAdmin(room)[0].username
			});
		}
	});

	socket.on('get user db id', ({ room, username }) => {
		Rooms.findAll({
			where: {
				name: room
			}
		}).then((rm) => {
			if (rm[0]) {
				RoomUsers.findAll({
					where: {
						room_id: rm[0].dataValues.id,
						name: username
					}
				}).then((res) => {
					if (res[0]) {
						socket.emit('userDBId', ({ user_id: res[0].dataValues.id }));
					} else {
						socket.emit('user id not found', ({ error: 'user id not found' }));
					}
				})
			}
		})
	})

	socket.on('disconnect', () => {
		const user = removeUser(socket.id);
		console.log(user);

		if (user) {
			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUserInRoom(user.room)
			});
		}
	});

	socket.on('get room levels', ({ room }) => {
		io.to(room).emit('roomLevels', {
			room: room,
			levels: getRoomLevels(room)
		})
	});

	socket.on('toggle level', ({ room, level_id }) => {
		Rooms.findAll({
			where: {
				name: room
			}
		}).then((res) => {
			const { error, levels } = toggleLevel({ room: room, room_id: res[0].dataValues.id, level_id: level_id });

			if (error) {
				socket.emit('failed to add level', ({ error }));
			} else {
				io.to(room).emit('roomLevels', {
					room: room,
					levels: levels
				})
			}
		})
	});
});
