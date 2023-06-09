import { create } from 'zustand'
import type { RouterOutputs } from '~/utils/api'

type PostWithAuthor = RouterOutputs["post"]["getAll"][number]

type ReplyModalState = {
  active: boolean
  post: PostWithAuthor | undefined
  setReplyModal: (post: PostWithAuthor) => void
  closeModal: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const useReplyModal = create<ReplyModalState>()((set) => ({
  active: false,
  post: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  setReplyModal: (post: PostWithAuthor) => set(() => ({ active: true, post })),
  closeModal: () => set(() => ({ active: false, postId: undefined })),
}))

export {
  useReplyModal,
}
