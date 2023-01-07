import Rooms from './RoomsModels.js';
import RoomUsers from './RoomUsersModel.js';
import Stats from './StatsModels.js';
import Users from './UserModels.js';
import Levels from './LevelsModel.js';

Levels.hasMany(Stats, {
	onUpdate: 'CASCADE',
});

Users.hasMany(Stats, {
	onUpdate: 'CASCADE',
});

RoomUsers.hasMany(Stats, {
	onUpdate: 'CASCADE',
});

Stats.belongsTo(Levels, { foreignKey: 'level' });
Stats.belongsTo(Users, { foreignKey: 'user_id' });
Stats.belongsTo(RoomUsers, { foreignKey: 'room_user_id' });

RoomUsers.hasOne(Rooms, {
	onUpdate: 'CASCADE'
});

Rooms.belongsTo(RoomUsers, { foreignKey: 'admin_id' });

Levels.hasOne(Rooms, {
	onDelete: 'RESTRICT',
	onUpdate: 'RESTRICT',
})

Rooms.belongsTo(Levels, { foreignKey: 'level' });

(async () => {
	await db.sync();
})();

export { Rooms, RoomUsers, Users, Levels, Stats };
