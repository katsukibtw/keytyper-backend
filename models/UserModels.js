import { Sequelize } from "sequelize";
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Users = db.define('users', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	login: {
		type: DataTypes.STRING,
		unique: true
	},
	pass: {
		type: DataTypes.STRING
	},
	name: {
		type: DataTypes.STRING
	},
	refresh_token: {
		type: DataTypes.TEXT
	}
}, {
	freezeTableName: true
});

(async () => {
	await db.sync();
})();

export default Users;
