import { Sequelize } from "sequelize";
import db from '../config/Database.js';

const { DataTypes } = Sequelize;

const Stats = db.define('stats', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    level: {
        type: DataTypes.STRING
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
    date: {
        type: DataTypes.DATE
    },
    user_id: {
        type: DataTypes.INTEGER
    },
    room_user_id: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
});

(async () => {
    await db.sync();
})();

export default Stats;