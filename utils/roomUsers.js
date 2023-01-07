const users = []
export const addUser = ({ id, username, room, room_id, isAdmin }) => { //clean the data

	username = username.trim()
	room = room.trim()

	//validate data
	if (!username || !room) {
		return {
			error: 'Username and room are required!'
		}
	}

	//check for existing users
	const existingUser = users.find((user) => {
		return user.room === room && user.username === username
	})
	//validate username
	if (existingUser) {
		return {
			error: "username is already used"
		}
	}

	//store user
	const user = {
		id: id,
		username: username,
		room: room,
		room_id: room_id,
		isAdmin: isAdmin
	}
	users.push(user)
	return { user }
}


export const removeUser = (id) => {
	const index = users.findIndex((user) => {
		return user.id === id
	})
	if (index !== -1) {
		return users.splice(index, 1)[0]
	}
}

export const getUser = (id) => {
	return users.find((user) => {
		return user.id === id
	})
}

export const getUserInRoom = (room) => {
	return users.filter((user) => {
		return user.room === room
	})
}

export const getRoomAdmin = (room) => {
	return users.filter((user) => {
		return user.room === room && user.isAdmin
	});
}
