import React from "react";
import { api } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoaderSpinner } from "./loading";
import { useUser } from "@clerk/nextjs";
import { useReplyModal } from "~/store";
import { useState } from "react";
import CloseSVG from "~/svgs/CloseSVG";
import { toast } from "react-hot-toast";

dayjs.extend(relativeTime);

function ReplyModal() {
  const [ input, setInput ] = useState('');

  const { active, post, closeModal } = useReplyModal();

  const { user } = useUser();

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.post.reply.useMutation();

  if (!post || !active || !user) return null;  

  function replyTweet(e: React.SyntheticEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (!user) {
      toast.error('Please log in first!')
      return;
    }
    if (!input || !post) return;

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
            <form onSubmit={replyTweet} className="flex flex-row px-4 gap-x-2 py-2 border-b border-slate-400">
              <div className="bg-slate-400 rounded-full w-12 h-12 overflow-hidden relative">
                <Image
                  src={user.profileImageUrl}
                  alt={`@${user.username ?? ''}'s profile picture`}
                  fill
                />
              </div>
              <div className="flex-grow flex flex-col">
                <input
                  type="text"
                  name="tweet"
                  id="tweet"
                  value={input}
                  onChange={(e) => {setInput(e.target.value)}}
                  placeholder="Tweet your reply"
                  className="text-lg bg-transparent focus-visible:outline-none p-2 block"
                  required
                  disabled={isPosting}
                />
                <div className="flex flex-row justify-end">
                  {isPosting &&
                    <div className="h-fit self-center"><LoaderSpinner size={24} /></div>
                  }
                  <button
                    className="px-4 py-2 text-md bg-sky-500 rounded-3xl"
                    type="submit"
                    disabled={isPosting}
                  >Reply</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReplyModal;
