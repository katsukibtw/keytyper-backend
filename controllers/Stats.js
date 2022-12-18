import Stats from '../models/StatsModels.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Sequelize } from 'sequelize';
import { underscoredIf } from 'sequelize/types/utils.js';

export const addStatEnrty = async (req, res, next) => {
    const { level, wpm, errors, cr_words, time, user_id, room_user_id } = req.body;
    try {
        await Stats.create({
            level: level,
            wpm: wpm,
            errors: errors,
            cr_words: cr_words,
            time: time,
            user_id: user_id,
            room_user_id: room_user_id
        });
        res.json({msg: "success"});
    } catch (error) {
        console.log(error);
    }
    
    next();
}

export const getUserStats = async (req, res, next) => {
    const stats = Stats.findAll({
        where: {
            user_id: req.body.user_id
        }
    }).then((res) => res);
    res.json(res);
}