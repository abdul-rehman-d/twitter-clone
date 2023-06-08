import React from 'react'
import Image from 'next/image'
import { api, type RouterOutputs } from '~/utils/api'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'
import { useUser } from '@clerk/nextjs'
import HeartSVG from '~/svgs/HeartSVG'
import { toast } from 'react-hot-toast'

dayjs.extend(relativeTime)

type PostWithAuthor = RouterOutputs["post"]["getAll"][number]

const PostView = (props: {post: PostWithAuthor}) => {
  const { post, author } = props.post
  const { isSignedIn } = useUser();

  const ctx = api.useContext()

  const isLiked = (
    isSignedIn
    ? api.like.isLiked.useQuery(
      { postId: post.id },
    ).data
    : false
  );

  const likeMutation = api.like.likeOrDislike.useMutation({
    onSuccess: () => {
      void ctx.post.getAll.invalidate();
      void ctx.like.isLiked.invalidate({ postId: post.id });
      void ctx.post.getById.invalidate({ id: post.id });
      void ctx.post.getPostsByUserId.invalidate({ userId: author.id });
    }
  });

  function likeOrUnlikePost(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please log in first!')
      return;
    }

    likeMutation.mutate({
      postId: post.id,
    });
  }

  return (
    <Link href={`/post/${post.id}`} className="flex flex-row p-4 gap-x-4 border-b border-slate-400">
      <div className="bg-slate-400 rounded-full w-12 h-12 overflow-hidden relative">
        <Image
          src={author.profileImageUrl}
          alt={`@${author.username ?? ''}'s profile picture`}
          fill
        />
      </div>
      <div className="flex-grow flex flex-col mb-2">
        <div className="text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          {' · '}
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <p className="text-xl mb-2">{post.content}</p>
        <div>
          <button
            className='group flex flex-row items-center gap-x-1 text-slate-400 hover:text-red-400'
            onClick={likeOrUnlikePost}
          >
            <span className='group-hover:bg-red-400 group-hover:bg-opacity-10 rounded-full p-1 h-7 w-7'>
              <HeartSVG fill={isLiked} />
            </span>
            <span>{post._count.likes}</span>
          </button>
        </div>
      </div>
    </Link>
  )
}

export default PostView
