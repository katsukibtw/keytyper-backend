import { Sequelize } from "sequelize";
import db from "../config/Database.js";
import Levels from "./LevelsModel.js";

const { DataTypes } = Sequelize;

const Rooms = db.define('rooms', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	name: {
		type: DataTypes.STRING,
		unique: true
	},
	safe_code: {
		type: DataTypes.STRING,
		unique: true,
	},
	admin_id: {
		type: DataTypes.INTEGER,
	},
	level: {
		type: DataTypes.INTEGER,
		references: {
			model: Levels,
			key: 'id'
		}
	},
}, {
	freezeTableName: true
});

export default Rooms;
