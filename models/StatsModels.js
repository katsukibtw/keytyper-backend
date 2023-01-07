import { Sequelize } from "sequelize";
import db from '../config/Database.js';
import Users from "./UserModels.js";
import RoomUsers from "./RoomUsersModel.js";
import Rooms from './RoomsModels.js';
import Levels from "./LevelsModel.js";

const { DataTypes } = Sequelize;

const Stats = db.define('stats', {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	level: {
		type: DataTypes.INTEGER,
		references: {
			model: Levels,
			key: 'id'
		}
	},
	wpm: {
		type: DataTypes.INTEGER
	},
	errors: {
		type: DataTypes.INTEGER
	},
	cr_words: {
		type: DataTypes.INTEGER
	},
	time: {
		type: DataTypes.INTEGER
	},
	user_id: {
		type: DataTypes.INTEGER,
		references: {
			model: Users,
			key: 'id'
		},
		defaultValue: null
	},
	room_user_id: {
		type: DataTypes.INTEGER,
		references: {
			model: RoomUsers,
			key: 'id'
		},
		defaultValue: null
	},
	room_id: {
		type: DataTypes.INTEGER,
		references: {
			model: Rooms,
			key: 'id',
		},
		defaultValue: null
	}
}, {
	freezeTableName: true
});

(async () => {
	await db.sync();
})();

export default Stats;
