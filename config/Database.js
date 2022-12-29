import { Sequelize } from "sequelize";

const db = new Sequelize('keytyper', 'keytyper', 'KamatQuyu--36i1', {
	host: 'localhost',
	dialect: 'mysql',
	port: 3306
})

db.authenticate()
	.then(() => {
		console.log('Connection has been established successfully.');
	})
	.catch(err => {
		console.error('Unable to connect to the database:', err);
	});

export default db;
