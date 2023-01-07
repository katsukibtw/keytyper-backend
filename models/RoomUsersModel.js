import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Rooms from "./RoomsModels.js";

const { DataTypes } = Sequelize;

const RoomUsers = db.define('room_users', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING
	},
	room_id: {
		type: DataTypes.INTEGER,
		references: {
			model: Rooms,
			key: 'id'
		}
	}
}, {
	freezeTableName: true
});

export default RoomUsers;
