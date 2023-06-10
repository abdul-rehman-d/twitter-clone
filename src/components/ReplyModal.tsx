import React from "react";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { useUser } from "@clerk/nextjs";
import { useReplyModal } from "~/store";
import CloseSVG from "~/svgs/CloseSVG";
import { toast } from "react-hot-toast";
import ReplyTweetForm from "./ReplyTweetForm";

dayjs.extend(relativeTime);

function ReplyModal() {
  const { active, post, closeModal } = useReplyModal();

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.post.reply.useMutation();

  if (!post || !active || !user) return null;  

  function replyTweet(input: string) {
    if (!user) {
      toast.error('Please log in first!')
      return;
    }
    if (!post) return;

    mutate({
      content: input,
      postId: post.post.id,
    }, {
      onSuccess: () => {
        void ctx.post.getAll.invalidate();
        void ctx.post.getById.invalidate({ id: post.post.id });
        void ctx.post.getPostsByUserId.invalidate({ userId: post.author.id });
        closeModal();
      }
    });
  }

  return (
    <div
      tabIndex={-1}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 flex h-full max-h-full w-full justify-center overflow-y-auto overflow-x-hidden bg-[#495a6966] p-4 md:inset-0"
    >
      <div className="relative max-h-full w-full max-w-xl">
        <div className="relative rounded-2xl bg-black">
          <div className="p-4">
            <button
              type="button"
              className="text-late-400 inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm"
              onClick={() => {
                closeModal();
              }}
            >
              <CloseSVG />
              <span className="sr-only">Close modal</span>
            </button>
          </div>
          <div>
            <div className="flex flex-row gap-x-4 p-4">
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-400">
                <Image
                  src={post.author.profileImageUrl}
                  alt={`@${post.author.username ?? ""}'s profile picture`}
                  fill
                />
              </div>
              <div className="mb-2 flex flex-grow flex-col">
                <div className="text-slate-300">
                  <span>{`@${post.author.username}`}</span>
                  {" · "}
                  <span className="font-thin">
                    {dayjs(post.post.createdAt).fromNow()}
                  </span>
                </div>
                <p className="mb-2">{post.post.content}</p>
              </div>
            </div>
            <ReplyTweetForm onSubmit={replyTweet} isPosting={isPosting} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReplyModal;
