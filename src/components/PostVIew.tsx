import React, { type PropsWithChildren } from "react";
import Image from "next/image";
import { api } from "~/utils/api";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import HeartSVG from "~/svgs/HeartSVG";
import { toast } from "react-hot-toast";
import ReplySVG from "~/svgs/ReplySVG";
import { useReplyModal } from "~/store";
import type { PostOrReplyWithAuthor } from "~/types";

dayjs.extend(relativeTime);

type WrapperProps = {
  isReply: boolean;
  postId: string;
  className: string;
};

const Wrapper = ({
  isReply,
  children,
  className,
  postId,
}: PropsWithChildren<WrapperProps>) => {
  if (!isReply) {
    return (
      <Link href={`/post/${postId}`} className={className}>
        {children}
      </Link>
    );
  }

  return <div className={className}>{children}</div>;
};

const isReply = (post: PostOrReplyWithAuthor): boolean =>
  Boolean("repliedBy" in post.post);

const PostView = (props: { post: PostOrReplyWithAuthor }) => {
  const { author, post } = props.post;
  const { isSignedIn } = useUser();
  const setReplyModal = useReplyModal((state) => state.setReplyModal);

  const ctx = api.useContext();

  const isLiked =
    api.like.isLiked.useQuery({ id: post.id, isReply: isReply(props.post) })
      .data ?? false;

  const likeMutation = api.like.likeOrDislike.useMutation({
    onSuccess: () => {
      if (isReply(props.post)) {
        void ctx.reply.getAllByPostId.invalidate();
      } else {
        void ctx.post.getAll.invalidate();
        void ctx.post.getById.invalidate({ id: post.id });
        void ctx.post.getPostsByUserId.invalidate({ userId: author.id });
      }
      void ctx.like.isLiked.invalidate({ id: post.id });
    },
  });

  function likeOrUnlikePost(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please log in first!");
      return;
    }

    likeMutation.mutate({
      id: post.id,
      isReply: isReply(props.post),
    });
  }

  function replyTweet(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!isSignedIn) {
      toast.error("Please log in first!");
      return;
    }
    setReplyModal(props.post);
  }

  return (
    <Wrapper
      postId={post.id}
      className="flex flex-row gap-x-4 border-b border-slate-400 p-4"
      isReply={isReply(props.post)}
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-400">
        <Image
          src={author.profileImageUrl}
          alt={`@${author.username ?? ""}'s profile picture`}
          fill
        />
      </div>
      <div className="mb-2 flex flex-grow flex-col">
        <div className="text-sm text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          {" · "}
          <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
        </div>
        <p className="mb-2">{post.content}</p>
        <div className="flex flex-row gap-x-4">
          {!isReply(props.post) && (
            <button
              className="group flex flex-row items-center gap-x-1 text-slate-400 hover:text-sky-500"
              onClick={replyTweet}
            >
              <span className="h-7 w-7 rounded-full p-1 group-hover:bg-sky-500 group-hover:bg-opacity-10">
                <ReplySVG />
              </span>
              <span>{post._count.replies}</span>
            </button>
          )}
          <button
            className={`group flex flex-row items-center gap-x-1 hover:text-red-400 ${
              isLiked ? "text-red-400" : "text-slate-400"
            }`}
            onClick={likeOrUnlikePost}
          >
            <span className="h-7 w-7 rounded-full p-1 group-hover:bg-red-400 group-hover:bg-opacity-10">
              <HeartSVG fill={isLiked} />
            </span>
            <span>{post._count.likes}</span>
          </button>
        </div>
      </div>
    </Wrapper>
  );
};

export default PostView;
