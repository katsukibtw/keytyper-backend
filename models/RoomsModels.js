import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Rooms = db.define('rooms', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING
    },
    safe_code: {
        type: DataTypes.STRING
    },
    admin_id: {
        type: DataTypes.INTEGER
    },
    type: {
        type: DataTypes.STRING
    },
    expires_in: {
        type: DataTypes.STRING,
        defaultValue: '1d'
    }
}, {
    freezeTableName: true
});

export default Rooms;