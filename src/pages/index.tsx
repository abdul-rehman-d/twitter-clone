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

  const [input, setInput] = useState<string>("");

  const ctx = api.useContext();

  const { mutate, isLoading: isPosting } = api.post.create.useMutation({
    onSuccess: () => {
      setInput("");
      void ctx.post.getAll.invalidate();
    },
    onError: (err) => {
      const errorMessage = err.data?.zodError?.fieldErrors.content;
      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Something went wrong. Please try again later!");
      }
    },
  });

  if (!user) return null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (input) {
      mutate({
        content: input,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-row gap-x-2 border-b border-slate-400 px-4 py-2"
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
          placeholder="What's Happening?"
          className="text-md block bg-transparent p-2 focus-visible:outline-none"
          required
          disabled={isPosting}
        />
        <div className="flex flex-row justify-end">
          {!!isPosting && (
            <div className="h-fit self-center">
              <LoaderSpinner size={24} />
            </div>
          )}
          <button
            className="text-md rounded-3xl bg-sky-500 px-4 py-2"
            type="submit"
            disabled={isPosting}
          >
            Tweet
          </button>
        </div>
      </div>
    </form>
  );
};

const Feed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery();

  if (postsLoading)
    return (
      <div className="flex flex-grow flex-col justify-center">
        <LoaderSpinner size={30} />
      </div>
    );

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((post) => (
        <PostView key={post.post.id} post={post} />
      ))}
    </div>
  );
};

const Home: NextPage = () => {
  const { isSignedIn: userSignedIn, isLoaded: userLoading } = useUser();

  // since React Query fetches only once, calling this in Page Component
  // makes sure React Query fetches the data ASAP
  api.post.getAll.useQuery();

  if (!userLoading) return <LoadingPage />;

  return (
    <>
      <PageLayout headerText="Home">
        {userSignedIn ? (
          <CreatePost />
        ) : (
          <div className="flex w-full flex-row justify-center border-b border-slate-400 py-2">
            <div className="text-md rounded-3xl bg-sky-500 px-4 py-2 font-semibold">
              <SignInButton />
            </div>
          </div>
        )}
        <Feed />
      </PageLayout>
    </>
  );
};

export default Home;
