import { Request, Response } from 'express';
import postService from '../service/post-service';
import participantService from '../service/participant-service';
import { getPostsOption } from '../type';
import { decodeToken } from '../util';

export const getPosts = async (req: Request, res: Response, next: Function) => {
  try {
    const posts = await postService.getPosts(req.query as getPostsOption);
    const result = await Promise.all(
      posts.map(async (post: any) => {
        const participantCnt = await participantService.getParticipantNum(
          post.id
        );
        post.participantCnt = participantCnt;
        return post;
      })
    );
    res.json(result);
  } catch (err: any) {
    next({ statusCode: 500, message: err.message });
  }
};

export const getPost = async (req: Request, res: Response, next: Function) => {
  try {
    const post = await postService.getPost(req.params.postId);
    const userId = decodeToken(req.cookies.user);
    if (userId === 'error') throw new Error('쿠키가 유효하지 않습니다.');
    const isParticipate: boolean = await participantService.checkParticipation(
      Number(req.params.postId),
      userId
    );

    const participantCnt = await participantService.getParticipantNum(
      Number(req.params.postId)
    );
    res.json({ ...post, participantCnt, isParticipate });
  } catch (err: any) {
    next({ statusCode: 500, message: err.message });
  }
};

export const savePost = async (req: Request, res: Response, next: Function) => {
  try {
    const postId = await postService.savePost(req.body);
    await postService.saveUrls(req.body.urls, postId);
    await participantService.saveParticipant(Number(req.body.userId), postId);
    res.json(postId);
  } catch (err: any) {
    next({ statusCode: 500, message: err.message });
  }
};

export const getHost = async (req: Request, res: Response, next: Function) => {
  try {
    const { postId } = req.params;
    const userId = await postService.getHost(+postId);
    res.json(userId);
  } catch (err: any) {
    next({ statusCode: 500, message: err.message });
  }
};

export const getPostFinished = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const { postId } = req.params;
    const finished = await postService.getFinished(+postId);
    res.json(finished);
  } catch (err: any) {
    next({ statusCode: 500, message: err.message });
  }
};

export const finishPost = async (
  req: Request,
  res: Response,
  next: Function
) => {
  try {
    const { postId } = req.params;
    await postService.updatePostFinished(+postId);
    res.status(200).send();
  } catch (err: any) {
    next({ statusCode: 500, message: err.message });
  }
};
