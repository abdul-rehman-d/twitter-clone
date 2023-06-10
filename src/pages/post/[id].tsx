import Head from "next/head";
import { type GetStaticProps, type NextPage } from "next";

import { type RouterOutputs, api } from "~/utils/api";

import PostView from "~/components/PostVIew";
import PageLayout from "~/layouts/PageLayout";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { NotFound } from "~/components/404Page";
import { LoaderSpinner } from "~/components/loading";
import { useUser } from "@clerk/nextjs";
import { useReplyModal } from "~/store";
import { toast } from "react-hot-toast";
import HeartSVG from "~/svgs/HeartSVG";
import ReplySVG from "~/svgs/ReplySVG";
import Link from "next/link";
import Image from "next/image";
import dayjs from "dayjs";
import ReplyTweetForm from "~/components/ReplyTweetForm";

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

const MainPostView = (props: {post: RouterOutputs["post"]["getAll"][number]}) => {
  const { author, post } = props.post
  const { isSignedIn } = useUser();
  const setReplyModal = useReplyModal(state => state.setReplyModal)

  const ctx = api.useContext()

  const isLiked = api.like.isLiked.useQuery(
    { id: post.id, isReply: false },
  ).data ?? false;

  const likeMutation = api.like.likeOrDislike.useMutation({
    onSuccess: () => {
      void ctx.post.getAll.invalidate();
      void ctx.like.isLiked.invalidate({ id: post.id });
      void ctx.post.getById.invalidate({ id: post.id });
      void ctx.post.getPostsByUserId.invalidate({ userId: author.id });
    }
  });

  const replyMutation = api.post.reply.useMutation();

  function likeOrUnlikePost(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please log in first!')
      return;
    }

    likeMutation.mutate({
      id: post.id,
      isReply: false,
    });
  }

  function openReplyModal(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please log in first!')
      return;
    }
    setReplyModal(props.post);
  }

  function replyTweet(input: string) {
    replyMutation.mutate({
      content: input,
      postId: post.id,
    }, {
      onSuccess: () => {
        void ctx.post.getAll.invalidate();
        void ctx.post.getById.invalidate({ id: post.id });
        void ctx.post.getPostsByUserId.invalidate({ userId: author.id });
      }
    });
  }

  return (
    <div className="flex flex-col gap-y-4 p-4 border-b border-slate-400">
      <div className="flex flex-row gap-x-4 items-center">
        <div className="bg-slate-400 rounded-full w-12 h-12 overflow-hidden relative">
          <Image
            src={author.profileImageUrl}
            alt={`@${author.username ?? ''}'s profile picture`}
            fill
          />
        </div>
        <div className="text-slate-300 flex-grow">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
        </div>
      </div>
      <p className="text-xl">{post.content}</p>
      <div className="flex flex-row border-b border-slate-400 pb-4">
        <span className="font-thin">
          {dayjs(post.createdAt).format('h:m A · MMM D, YYYY')}
        </span>
      </div>
      <div className="flex flex-row border-b border-slate-400 pb-4">
        <div>
          {post._count.likes}
          {" "}
          <span className="font-thin">
            {`Like${post._count.likes !== 1 ? 's' : ''}`}
          </span>
        </div>
      </div>
      <div className={"flex flex-row border-slate-400 " + (isSignedIn ? 'border-b pb-4' : '')}>
        <div className="w-1/6 flex flex-row justify-center">
          <button
            onClick={openReplyModal}
            className='hover:bg-sky-500 hover:bg-opacity-10 rounded-full h-8 w-8 flex justify-center items-center'
          >
            <ReplySVG />
          </button>
        </div>
        <div className="w-1/6 flex flex-row justify-center">
          <button
            className='hover:bg-red-400 hover:bg-opacity-10 rounded-full h-8 w-8 flex justify-center items-center'
            onClick={likeOrUnlikePost}
          >
            <HeartSVG fill={isLiked} />
          </button>
        </div>
      </div>
      <ReplyTweetForm
        onSubmit={replyTweet}
        isPosting={replyMutation.isLoading}
        showBottomBorder={false}
      />
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
          <MainPostView post={data} />
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
