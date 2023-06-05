import express from "express";
import dotenv from 'dotenv';
import cookieMiddleware from 'universal-cookie-express';
import cors from 'cors';
import router from "./routes/index.js";
import { Server } from 'socket.io';
import prisma from './prisma.js';

// socket functions for rooms handling
import { addUser, removeUser, getUserInRoom, getRoomAdmin } from './utils/roomUsers.js';
import { getRoomLevels, toggleLevel } from "./utils/roomLevelHandler.js";

dotenv.config();
const app = express();
app.use(cookieMiddleware());

// CORS middleware (settings)
var corsMiddleware = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', 'http://localhost:3000'); //replace localhost with actual host
	res.header('Access-Control-Allow-Credentials', true);
	res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, PATCH, POST, DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With, Authorization');

	next();
}

const port = process.env.PORT || 5000 // port which server is placed on

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(corsMiddleware);
app.use(express.json());
app.use(router);

const server = app.listen(port, () => console.log(`Server running at port ${port}`));
const io = new Server(server);

io.on('connection', (socket) => {
	console.log('new connection');

	socket.on('create-room', async ({ room_name, admin_name }) => {
		const room = await prisma.rooms.findFirst({
			where: {
				name: room_name
			}
		})

		if (room) {
			socket.emit('room already exists');
		} else {
			var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
			var codeLen = 6;
			var code = '';

			for (var i = 0; i < codeLen; i++) {
				var randomNumber = Math.floor(Math.random() * chars.length);
				code += chars.substring(randomNumber, randomNumber + 1);
			}

			const createdRoom = await prisma.rooms.create({
				data: {
					name: room_name,
					safe_code: code,
					admin_id: 1,
				}
			})

			const createdUser = await prisma.room_users.create({
				data: {
					name: admin_name,
					room_id: createdRoom.id
				}
			})

			await prisma.rooms.update({
				where: {
					id: createdUser.room_id
				},
				data: {
					admin_id: createdUser.id
				}
			})

			const { error, user } = addUser({ id: socket.id, username: admin_name, room: room_name, room_id: createdRoom.id, isAdmin: true });
			if (error) {
				socket.emit('failed to join', { error });
			}
			socket.join(user.room);

			io.to(user.room).emit("roomData", {
				room: user.room,
				users: getUserInRoom(user.room),
				admin: getRoomAdmin(user.room)[0].username,
			});

			socket.emit('room created', { safe_code: code, room_id: user.room_id });
		}
	});

	socket.on('check if room exists', async ({ safe_code }) => {
		const room = await prisma.rooms.findFirst({
			where: {
				safe_code: safe_code
			}
		});

		if (room) {
			socket.emit('room exists', { safe_code });
		} else {
			socket.emit('room not exist');
		}
	});

	socket.on('join', async ({ safe_code, username }) => {
		const room = await prisma.rooms.findFirst({
			where: {
				safe_code: safe_code
			}
		});

		if (room) {
			const rUser = await prisma.room_users.findFirst({
				where: {
					name: username,
					room_id: room.id
				}
			});

			var isadm = false;
			if (!rUser) {
				await prisma.room_users.create({
					data: {
						name: username,
						room_id: room.id
					}
				})
			} else if (room.admin_id === rUser.id) {
				isadm = true;
			}

			const { error, user } = addUser({ id: socket.id, username: username, room: room.name, room_id: room.id, isAdmin: isadm });
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

				socket.emit('joined', { room_name: room.name, safe_code: room.safe_code, username: user.username, room_id: user.room_id });
			}
		}
	})

	socket.on('get room data', async ({ room }) => {
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

	socket.on('get user db id', async ({ room, username }) => {
		const fRoom = await prisma.rooms.findFirst({
			where: {
				name: room
			}
		});

		if (fRoom) {
			const roomUser = await prisma.room_users.findFirst({
				where: {
					room_id: fRoom.id,
					name: username
				}
			});

			if (roomUser) {
				socket.emit('userDBId', ({ user_id: roomUser.id }));
			} else {
				socket.emit('user id not found', ({ error: 'user id not found' }));
			}
		}
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

	socket.on('toggle level', async ({ room, level_id }) => {
		const fRoom = await prisma.rooms.findFirst({
			where: {
				name: room
			}
		});
		const { error, levels } = toggleLevel({ room: room, room_id: fRoom.id, level_id: level_id });

		if (error) {
			socket.emit('failed to add level', ({ error }));
		} else {
			io.to(room).emit('roomLevels', {
				room: room,
				levels: levels
			})
		}
	});
});
