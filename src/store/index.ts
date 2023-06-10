import { create } from 'zustand'
import type { PostOrReplyWithAuthor } from '~/types'

type ReplyModalState = {
  active: boolean
  post: PostOrReplyWithAuthor | undefined
  setReplyModal: (post: PostOrReplyWithAuthor) => void
  closeModal: () => void
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
const useReplyModal = create<ReplyModalState>()((set) => ({
  active: false,
  post: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
  setReplyModal: (post: PostOrReplyWithAuthor) => set(() => ({ active: true, post })),
  closeModal: () => set(() => ({ active: false, postId: undefined })),
}))

export {
  useReplyModal,
}
