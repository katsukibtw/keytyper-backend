import Stats from '../models/StatsModels.js';

export const addStatEnrty = async (req, res) => {
	const { level, wpm, errors, cr_words, time, user_id, room_user_id } = req.body;
	if (wpm === 0 || wpm < 25 || errors !== 0) {
		if ((wpm === 0 || wpm < 25) && errors === 0) {
			res.json({ msg: ":( Слишком медленно. Попробуйте еще раз, но чуть быстрее.", corr: false });
		} else if (wpm >= 25 && errors !== 0) {
			res.json({ msg: ":( Слишком неаккуратно. Попробуйте еще раз, но чуть точнее.", corr: false });
		} else if ((wpm === 0 || wpm < 25) && errors !== 0) {
			res.json({ msg: ":( Медленно и неаккуратно! Попробуйте еще раз.", corr: false });
		}
	}
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
		res.json({ msg: ":) Вы молодец! Уровень успешно пройден!", corr: true });
	} catch (error) {
		console.log(error);
	}
}

export const getUserStats = async (req, res) => {
	const userid = req.headers['user_id'];
	if (!userid) return res.status(401).json({ msg: "there's no user" });
	const stats = Stats.findAll({
		where: {
			user_id: userid
		}
	}).then((result) => { return res.json(result) }).catch((error) => { return res.status(404).json({ msg: "there's no stats for this user" }) });
}
