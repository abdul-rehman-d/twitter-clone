import Image from "next/image";
import React, { useState } from "react";
import { LoaderSpinner } from "./loading";
import { useUser } from "@clerk/nextjs";

const ReplyTweetForm = ({
  isPosting,
  onSubmit,
}: {
  isPosting: boolean;
  onSubmit: (input: string) => void;
}) => {
  const { user } = useUser();

  const [input, setInput] = useState<string>("");

  if (!user) return null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!input) return;

        onSubmit(input);
      }}
      className={"flex flex-row gap-x-2 px-4 py-2"}
    >
      <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-400">
        <Image
          src={user.profileImageUrl}
          alt={`@${user.username ?? ""}'s profile picture`}
          fill
        />
      </div>
      <div className="flex flex-grow flex-col">
        <input
          type="text"
          name="tweet"
          id="tweet"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
          }}
          placeholder="Tweet your reply"
          className="block bg-transparent p-2 text-lg focus-visible:outline-none"
          required
          disabled={isPosting}
        />
        <div className="flex flex-row justify-end">
          {isPosting && (
            <div className="h-fit self-center">
              <LoaderSpinner size={24} />
            </div>
          )}
          <button
            className="text-md rounded-3xl bg-sky-500 px-4 py-2"
            type="submit"
            disabled={isPosting}
          >
            Reply
          </button>
        </div>
      </div>
    </form>
  );
};

export default ReplyTweetForm;
