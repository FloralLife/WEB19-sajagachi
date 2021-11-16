import { getDB } from '../db/db';
import { Participant } from '../model/entity/Participant';

const getParticipantNum = async (postId: number) => {
	const db = await getDB().get();
	const result = await db.manager.count(Participant, {
		where: { postId }
	});
	if (result === undefined)
		throw new Error(
			`${postId}번째 게시글 사용자수를 가지고오는데 오류가 발생했습니다.`
		);

	return result;
};

const getParticipants = async (postId: number) => {
	const db = await getDB().get();
	const result = await db.manager.find(Participant, {
		where: { postId },
		relations: ['user']
	});
	return result;
};

const saveParticipant = async (userId: number, postId: number) => {
	const db = await getDB().get();

	const newParticipant = db.manager.create(Participant, {
		userId,
		postId
	});
	const createdParticipant = await db.manager.save(newParticipant);

	return createdParticipant;
};

export default { getParticipantNum, getParticipants, saveParticipant };
