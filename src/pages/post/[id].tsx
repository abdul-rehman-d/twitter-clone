import Head from "next/head";
import { type GetStaticProps, type NextPage } from "next";

import { api } from "~/utils/api";

import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { NotFound } from "~/components/404Page";
import { LoaderSpinner } from "~/components/loading";

const RepliesFeed  = (props: { postId: string }) => {
  const { data, isLoading: repliesLoading } = api.reply.getAllByPostId.useQuery({
    postId: props.postId,
  })

  if (repliesLoading)
    return <div className="flex-grow flex flex-col justify-center"><LoaderSpinner size={30} /></div>

  if (!data || !data.length)
    return <div className="text-center pt-5">{"No Replies"}</div>

  return (
    <div className="flex flex-col">
      {
        data.map((reply) => (
          <PostView
            key={reply.reply.id}
            post={{ post: reply.reply, author: reply.author }}
          />
        ))
      }
    </div>
  )
}

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getById.useQuery({
    id
  })

  if (!data) return (<NotFound name="Post" />)

  return (
    <>
      <Head>
        <title>{`${data.post.content} - ${data.author.username} | Twitter Clone`}</title>
      </Head>
      <PageLayout
        headerText="Thread"
        showBackButton
      >
        <div className="flex-grow flex flex-col">
          <PostView post={data} />
          <RepliesFeed postId={id} />
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper()
  
  const id = context.params?.id

  if (typeof id !== "string") throw new Error("No Post")

  await ssg.post.getById.prefetch({ id })

  return {
    props: {
      trpcState: ssg.dehydrate(),
      id,
    },
  };
}

export const getStaticPaths = () => {
  return { paths: [], fallback: "blocking" };
};

export default SinglePostPage;
