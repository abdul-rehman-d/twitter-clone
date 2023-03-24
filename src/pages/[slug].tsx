import Head from "next/head";
import { type NextPage } from "next";

import { api } from "~/utils/api";


import { LoaderSpinner } from "~/components/loading";
import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";


const ProfileFeed = () => {
  const { data, isLoading: postsLoading } = api.post.getAll.useQuery()

  if (postsLoading)
    return <div className="pt-52 flex"><LoaderSpinner size={30} /></div>

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
  // since React Query fetches only once, calling this in Page Component
  // makes sure React Query fetches the data ASAP
  api.post.getAll.useQuery()

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <ProfileFeed />
      </PageLayout>
    </>
  );
};

export default Home;
