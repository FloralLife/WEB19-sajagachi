import React, { useEffect, useRef, useState } from 'react';
import {
	Card,
	CardContent,
	Typography,
	IconButton,
	CircularProgress
} from '@mui/material';
import Box from '@mui/material/Box';
import styled from '@emotion/styled';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { Chip } from '@mui/material';
import { fetchGet } from '../../util/util';
import 'dotenv/config';
import { RouteComponentProps } from 'react-router-dom';
import { css } from '@emotion/react';
import GroupBuyButton from './component/GroupBuyButton';
import DeadLine, { DeadLineHandle } from './component/DeadLine';
import LinkPreview from './component/LinkPreview';

interface MatchParams {
	postId: string;
}
interface PostType {
	id: number;
	lat: number;
	long: number;
	deadline: string;
	userId: number;
	categoryId: number;
	title: string;
	content: string;
	category: { id: number; name: string };
	finished: boolean;
	capacity: number;
	participantCnt: number;
}

const detailContainer = css`
	margin-left: auto;
	margin-right: auto;
	max-width: 700px;
`;
const StyledBox = styled(Box)(() => ({
	backgroundColor: '#ffe7e7',
	border: '1px solid #fefafa',
	marginLeft: 'auto',
	marginRight: 'auto',
	maxWidth: '700px'
}));

const StyledIconButton = styled(IconButton)`
	&:hover {
		background: white;
	}
`;

export default function Detail({ match }: RouteComponentProps<MatchParams>) {
	const [isLoad, setIsLoad] = useState(false);
	const deadLineRef = useRef<DeadLineHandle>();
	const [post, setPost] = useState<PostType>({
		id: 0,
		userId: 0,
		categoryId: 0,
		title: '',
		content: '',
		category: { id: 0, name: '' },
		lat: 0,
		long: 0,
		finished: false,
		capacity: 0,
		deadline: '',
		participantCnt: 0
	});

	useEffect(() => {
		let es: any = null;
		fetchGet(
			`${process.env.REACT_APP_SERVER_URL}/api/post/${match.params.postId}`
		).then(post => {
			if (!post.finished) {
				es = new EventSource(`${process.env.REACT_APP_SERVER_URL}/sse`);
				es.onmessage = function (e: MessageEvent) {
					if (deadLineRef.current) {
						const end = new Date(post.deadline);
						const server = new Date(parseInt(e.data, 10));
						end.setDate(end.getDate() - 1);
						if (server >= end) {
							deadLineRef.current.setDeadLine('0일 00:00:00');
							return;
						} else {
							const t = end.getTime() - server.getTime();
							const seconds = (
								'0' + Math.floor((t / 1000) % 60)
							).slice(-2);
							const minutes = (
								'0' + Math.floor((t / 1000 / 60) % 60)
							).slice(-2);
							const hours = (
								'0' + Math.floor((t / (1000 * 60 * 60)) % 24)
							).slice(-2);
							const days =
								'' + Math.floor(t / (1000 * 60 * 60) / 24);
							deadLineRef.current.setDeadLine(
								days +
									'일 ' +
									hours +
									':' +
									minutes +
									':' +
									seconds
							);
							return;
						}
					}
				};
			}
			setPost({ ...post });
			setIsLoad(true);
		});
		return () => {
			if (es !== null) {
				es.close();
			}
		};
	}, [deadLineRef.current]);
	return isLoad ? (
		<div css={detailContainer}>
			<Card
				sx={{
					borderRadius: 7,
					bgcolor: '#fefafa',
					border: '1px solid #fefafa',
					pb: '4.5rem'
				}}
				variant="outlined"
			>
				<CardContent>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between'
						}}
					>
						<Typography variant="h5">{post.title}</Typography>
						<Chip
							label={post.category.name}
							sx={{ color: 'grey' }}
						/>
					</Box>
					<Box
						sx={{
							display: 'flex',
							justifyContent: 'space-between',
							mt: 2
						}}
					>
						<Typography variant="body1">
							작성자| {post.userId}
						</Typography>
						<DeadLine ref={deadLineRef} />
					</Box>
					<Card
						sx={{
							mt: 2,
							minWidth: 275,
							minHeight: 275,
							bgcolor: '#ffe7e7',
							border: '1px solid #fefafa',
							borderRadius: 7
						}}
						variant="outlined"
					>
						<CardContent>
							<Typography variant="body2" lineHeight="2.5">
								{post.content}
							</Typography>
						</CardContent>
					</Card>
					<LinkPreview url="https://github.com/boostcampwm-2021/WEB19-sajagachi" />
				</CardContent>
			</Card>
			<StyledBox
				sx={{
					position: 'fixed',
					bottom: 0,
					borderTopLeftRadius: 30,
					borderTopRightRadius: 30,
					visibility: 'visible',
					right: 0,
					left: 0,
					height: '4.5rem'
				}}
			>
				<Box sx={{ display: 'flex', p: 1 }}>
					<StyledIconButton sx={{ bgcolor: 'white', p: 1, m: 1 }}>
						<FavoriteBorderIcon sx={{ fontSize: 30 }} />
					</StyledIconButton>
					<GroupBuyButton
						participantCnt={post.participantCnt}
						capacity={post.capacity}
						finished={post.finished}
					/>
				</Box>
			</StyledBox>
		</div>
	) : (
		<Box sx={{ display: 'flex' }}>
			<CircularProgress
				sx={{
					marginTop: '50%',
					marginLeft: 'auto',
					marginRight: 'auto',
					color: '#ebabab'
				}}
			/>
		</Box>
	);
}
