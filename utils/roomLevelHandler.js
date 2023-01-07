const room_levels = []

export const toggleLevel = ({ room, room_id, level_id }) => {
	// first let's check if data is given
	if (!room || !room_id || !level_id) {
		return {
			error: 'some data is missing'
		}
	}

	// check for already added levels
	const existingLevel = room_levels.find((level) => {
		return level.room == room && level.id == level_id
	});

	// if level is already enlisted, then remove it
	if (existingLevel) {

		// find index of existingLevel
		const index = room_levels.findIndex((level) => {
			return level.id == level_id && level.room == room
		})

		// return filtered by room name array of levels with removed existingLevel
		if (index !== -1) {
			room_levels.splice(index, 1);
			return {
				levels: room_levels.filter((level) => { return level.room === room })
			}
		}
	} else {
		const level = {
			id: level_id,
			room_id: room_id,
			room: room
		};
		room_levels.push(level);
		return {
			levels: room_levels.filter((level) => { return level.room === room })
		}
	}
}

export const getRoomLevels = (room) => {
	return room_levels.filter((level) => {
		return level.room === room
	});
}
