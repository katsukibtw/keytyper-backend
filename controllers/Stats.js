import prisma from '../prisma.js';

export const addStatEnrty = async (req, res) => {
	const { level, wpm, errors, cr_words, time, user_id, room_user_id, room_id } = req.body;
	if (wpm === 0 || wpm < 25 || errors > 3) {
		if ((wpm === 0 || wpm < 25) && errors <= 3) {
			res.json({ msg: ":( Слишком медленно. Попробуйте еще раз, но чуть быстрее.", corr: false });
		} else if (wpm >= 25 && errors > 3) {
			res.json({ msg: ":( Слишком неаккуратно. Попробуйте еще раз, но чуть точнее.", corr: false });
		} else if ((wpm === 0 || wpm < 25) && errors > 3) {
			res.json({ msg: ":( Медленно и неаккуратно! Попробуйте еще раз.", corr: false });
		}
	}
	try {
		await prisma.stats.create({
			data: {
				level: level,
				wpm: wpm,
				errors: errors,
				cr_words: cr_words,
				time: time,
				user_id: user_id,
				room_user_id: room_user_id,
				room_id: room_id,
			}
		});
		res.json({ msg: ":) Вы молодец! Уровень успешно пройден!", corr: true });
	} catch (error) {
		console.log(error);
	}
}

export const getUserStats = async (req, res) => {
	const userid = req.headers['user_id'];
	if (!userid) return res.status(401).json({ msg: "there's no user" });

	try {
		const stats = await prisma.stats.findMany({
			where: {
				user_id: Number(userid)
			}
		});
		res.json(stats);
	} catch (error) {
		return res.status(404).json({ msg: "there's no stats for this user", error: error });
	}
}

export const getRoomStats = async (req, res) => {
	const roomid = req.headers['room_id'];
	if (!roomid) return res.status(401).json({ msg: "there's no room" });

	try {
		const stats = await prisma.stats.findMany({
			where: {
				room_id: Number(roomid)
			}
		})
		res.json(stats);
	} catch (error) {
		return res.status(404).json({ msg: "there's no stats for this room", error: error });
	}
}
