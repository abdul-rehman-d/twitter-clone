import Image from "next/image"
import React, { useState } from "react"
import { LoaderSpinner } from "./loading"
import { useUser } from "@clerk/nextjs"

const ReplyTweetForm = ({ isPosting, onSubmit, showBottomBorder=true }: {
  isPosting: boolean
  showBottomBorder?: boolean
  onSubmit: (input: string) => void
}) => {
  const { user } = useUser();

  const [ input, setInput ] = useState<string>('')

  if (!user) return null;

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();

      if (!input) return;

      onSubmit(input)
    }} className={"flex flex-row px-4 gap-x-2 " + (showBottomBorder ? 'py-2 border-b border-slate-400' : 'pt-2')}>
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
          onChange={(e) => {
            setInput(e.target.value)
          }}
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
  )
}

export default ReplyTweetForm;