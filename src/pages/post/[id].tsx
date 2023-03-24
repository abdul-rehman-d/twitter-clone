import Head from "next/head";
import { type GetStaticProps, type NextPage } from "next";

import { api } from "~/utils/api";

import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { NotFound } from "~/components/404Page";

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
        <PostView post={data} />
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
