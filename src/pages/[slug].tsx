import Head from "next/head";
import { GetStaticProps, type NextPage } from "next";

import { api } from "~/utils/api";

import { LoaderSpinner } from "~/components/loading";
import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Link from "next/link";


const ProfileFeed = (props: {userId: string}) => {
  const { data, isLoading: postsLoading } = api.post.getPostsByUserId.useQuery({
    userId: props.userId
  })

  if (postsLoading)
    return <div className="pt-52 flex"><LoaderSpinner size={30} /></div>

  if (!data || !data.length)
    return <div>{"User hasn't posted"}</div>

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

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUsername.useQuery({
    username
  })

  if (!data) return (
    <main className="flex flex-col justify-center items-center">
      <h1 className="text-xl font-bold">404 | User Not Found</h1>
      <Link href="/" className="underline hover:text-slate-400">Go Back</Link>
    </main>
  )

  return (
    <>
      <Head>
        <title>{data.username}</title>
      </Head>
      <PageLayout
        headerText={data.username ? `@${data.username}` : ''}
        showBackButton
      >
        <ProfileFeed userId={data.id} />
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()
  
  const slug = context.params?.slug

  if (typeof slug !== "string") throw new Error("No Slug")

  const username = slug.replace("@", "")

  await ssg.profile.getUserByUsername.prefetch({ username })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default ProfilePage;
