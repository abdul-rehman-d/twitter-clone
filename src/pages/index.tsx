import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import Image from "next/image";
import { type NextPage } from "next";
import { type FormEvent } from "react";

import { api } from "~/utils/api";

const CreatePost = () => {
  const { user } = useUser();

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-row px-4 gap-x-2 py-2 border-b border-slate-400">
      <div className="bg-slate-400 rounded-full w-12 h-12 overflow-hidden relative">
        <Image
          src={user.profileImageUrl}
          alt={user.fullName || 'User Profile Picture'}
          fill
        />
      </div>
      <div className="flex-grow flex flex-col">
        <input
          type="text"
          name="tweet"
          id="tweet"
          placeholder="What's Happening?"
          className="text-md bg-transparent focus-visible:outline-none p-2 block"
        />
        <button
          className="px-4 py-2 text-md bg-sky-500 rounded-3xl ml-auto"
          type="submit"
        >Tweet</button>
      </div>
    </form>
  )
}

const Home: NextPage = () => {
  const { data, isLoading } = api.post.getAll.useQuery()

  const user = useUser()

  console.log('data', data)

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex justify-center min-h-screen">
        <div className="w-full md:max-w-2xl border-x border-slate-400">
          <div className="border-b border-slate-400 p-4">
            {user.isSignedIn
              ? <SignOutButton />
              : <SignInButton />
            }
          </div>
          <CreatePost />
          <div className="flex flex-col">
            {isLoading
              ? <div>Loading...</div>
              : (
                !data
                ? <div>Something went wrong</div>
                : (
                  [...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data, ...data].map(post => (
                    <div key={post.id} className="border-b border-slate-400 p-8">
                      <p>{post.content}</p>
                    </div>
                  ))
                )
              )
            }
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
