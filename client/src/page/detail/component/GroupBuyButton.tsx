import React, { useState, useCallback } from 'react';
import { Button } from '@mui/material';
import styled from '@emotion/styled';
import { useHistory } from 'react-router-dom';
import LoginModal from '../../../common/login-modal';

type GroupBuyButtonType = {
	postId: number;
	participantCnt: number;
	capacity: number;
	finished: boolean;
};

const DUMMY_USER = {
	id: 80206884,
	name: 'J119_안병웅'
};

const DUMMY_ISLOGIN = false;

export default function GroupBuyButton({
	postId,
	participantCnt,
	capacity,
	finished
}: GroupBuyButtonType) {
	const history = useHistory();
	const [isLoginModalOn, setIsLoginModalOn] = useState(false);
	const clickHandler = useCallback(() => {
		if (DUMMY_ISLOGIN) history.push(`/chat/${postId}`);
		else setIsLoginModalOn(true);
	}, [history]);
	return (
		<>
			<Button
				variant="contained"
				disabled={finished || participantCnt >= capacity ? true : false}
				sx={{
					bgcolor: '#F76A6A',
					':hover': {
						bgcolor: '#F76A6A'
					},
					flexGrow: 1,
					p: 1,
					m: 1,
					color: 'white',
					borderColor: '#F76A6A'
				}}
				onClick={clickHandler}
			>
				{finished
					? '모집 종료'
					: `공동 구매 (${participantCnt} / ${capacity})`}
			</Button>
			{isLoginModalOn && (
				<LoginModal setIsLoginModalOn={setIsLoginModalOn} />
			)}
		</>
	);
}
