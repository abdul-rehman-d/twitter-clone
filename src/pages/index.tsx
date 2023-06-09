import { SignInButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import { type NextPage } from "next";
import { useState, type FormEvent } from "react";

import { api } from "~/utils/api";


import { LoaderSpinner, LoadingPage } from "~/components/loading";
import { toast } from "react-hot-toast";
import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";

const CreatePost = () => {
  const { user } = useUser();

  const [input, setInput] = useState<string>('');

  const ctx = api.useContext()

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput('')
      void ctx.post.getAll.invalidate()
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0])
      } else {
        toast.error('Something went wrong. Please try again later!')
      }
    }
  })

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input) {
      mutate({
        content: input,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-row px-4 gap-x-2 py-2 border-b border-slate-400">
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
          placeholder="What's Happening?"
          className="text-md bg-transparent focus-visible:outline-none p-2 block"
          required
          disabled={isPosting}
        />
        <div className="flex flex-row justify-end">
          {!!isPosting &&
            <div className="h-fit self-center"><LoaderSpinner size={24} /></div>
          }
          <button
            className="px-4 py-2 text-md bg-sky-500 rounded-3xl"
            type="submit"
            disabled={isPosting}
          >Tweet</button>
        </div>
      </div>
    </form>
  )
}

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery()

  if (postsLoading)
    return <div className="flex-grow flex flex-col justify-center"><LoaderSpinner size={30} /></div>

  if (!data)
    return <div>Something went wrong</div>

  return (
    <div className="flex flex-col">
      {
        data.map((post) => (
          <PostView key={post.post.id} post={post} />
        ))
      }
    </div>
  )
}

const Home: NextPage = () => {
  const {
    isSignedIn: userSignedIn,
    isLoaded: userLoading
  } = useUser()

  // since React Query fetches only once, calling this in Page Component
  // makes sure React Query fetches the data ASAP
  api.post.getAll.useQuery()


  if (!userLoading) return <LoadingPage />

  return (
    <>
      <PageLayout headerText="Home">
        {userSignedIn
        ? <CreatePost />
        : (
          <div className="flex flex-row justify-center w-full py-2 border-b border-slate-400">
            <div className="px-4 py-2 text-md bg-sky-500 rounded-3xl font-semibold">
              <SignInButton />
            </div>
          </div>
        )
        }
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
