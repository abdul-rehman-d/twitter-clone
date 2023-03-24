import Head from "next/head";
import { GetStaticProps, type NextPage } from "next";

import { api } from "~/utils/api";

import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import Link from "next/link";

const SinglePostPage: NextPage<{ id: string }> = ({ id }) => {
  const { data } = api.post.getById.useQuery({
    id
  })

  if (!data) return (
    <main className="flex flex-col justify-center items-center">
      <h1 className="text-xl font-bold">404 | Post Not Found</h1>
      <Link href="/" className="underline hover:text-slate-400">Go Back</Link>
    </main>
  )

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
