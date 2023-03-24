import { type NextPage } from "next";
import { useUser } from "@clerk/nextjs";
import { api } from "~/utils/api";
import Head from "next/head";

const PostPage: NextPage = () => {
  const {
  } = useUser()

  // since React Query fetches only once, calling this in Page Component
  // makes sure React Query fetches the data ASAP
  api.post.getAll.useQuery()

  return (
    <>
      <Head>
      </Head>
      <main className="flex justify-center min-h-screen">
      </main>
    </>
  );
};

export default PostPage;
