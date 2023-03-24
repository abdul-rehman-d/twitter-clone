import Image from 'next/image'
import { type RouterOutputs } from '~/utils/api'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import Link from 'next/link'

dayjs.extend(relativeTime)

type PostWithAuthor = RouterOutputs["post"]["getAll"][number]

const PostView = (props: {post: PostWithAuthor}) => {
  const { post, author } = props.post
  return (
    <div className="flex flex-row p-4 gap-x-4 border-b border-slate-400">
      <div className="bg-slate-400 rounded-full w-12 h-12 overflow-hidden relative">
        <Image
          src={author.profileImageUrl}
          alt={`@${author.username ?? ''}'s profile picture`}
          fill
        />
      </div>
      <div className="flex-grow flex flex-col mb-4">
        <div className="text-slate-300">
          <Link href={`/@${author.username}`}>
            <span>{`@${author.username}`}</span>
          </Link>
          {' · '}
          <Link href={`/post/${post.id}`}>
            <span className="font-thin">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>
        <p className="text-xl">{post.content}</p>
      </div>
    </div>
  )
}

export default PostView
