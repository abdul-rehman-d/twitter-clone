import Head from "next/head";
import { type GetStaticProps, type NextPage } from "next";

import { api } from "~/utils/api";

import { LoaderSpinner } from "~/components/loading";
import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { NotFound } from "~/components/404Page";
import Image from "next/image";


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

  if (!data) return (<NotFound name="User" />)

  return (
    <>
      <Head>
        <title>{`${data.username ?? ""} | Twitter Clone`}</title>
      </Head>
      <PageLayout
        headerText={data.username ? `@${data.username}` : ''}
        showBackButton
      >
        <header className="flex flex-col border-b border-slate-400 pb-4">
          <div className="h-36 bg-gradient-to-r from-slate-800 to-slate-600" />
          <Image
            src={data.profileImageUrl}
            alt={`@${data.username ?? ''}'s profile picture`}
            width={128}
            height={128}
            className="-mt-[64px] rounded-full ml-4"
          />
          <div className="ml-4 mt-4">
            <span className="text-2xl font-bold">{data.username ? `@${data.username}` : ''}</span>
          </div>
        </header>
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
