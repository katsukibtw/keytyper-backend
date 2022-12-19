import { Sequelize } from "sequelize";
import db from "../config/Database.js";

const { DataTypes } = Sequelize;

const Levels = db.define('levels', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    filename: {
        type: DataTypes.STRING
    },
    step: {
        type: DataTypes.INTEGER
    }
}, {
    freezeTableName: true
})

export default Levels;