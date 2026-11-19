import { getFeedPosts, getPostById, FeedQueryOptions } from '../../api/feed';
import { createPost as apiCreatePost, CreatePostPayload } from '../../api/createPost';
import { likePost as apiLikePost, unlikePost as apiUnlikePost, checkIfLiked } from '../../api/likePost';

export const postService = {
  fetchFeed: (options?: FeedQueryOptions) => getFeedPosts(options),
  fetchPost: (postId: string) => getPostById(postId),
  publishPost: (payload: CreatePostPayload) => apiCreatePost(payload),
  toggleLike: async ({ postId, userId, isCurrentlyLiked }: { postId: string; userId: string; isCurrentlyLiked: boolean }) => {
    if (isCurrentlyLiked) {
      return apiUnlikePost({ postId, userId });
    } else {
      return apiLikePost({ postId, userId });
    }
  },
  isLiked: (postId: string, userId: string) => checkIfLiked({ postId, userId }),
};

export default postService;
