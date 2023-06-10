import type { Post, Reply } from "@prisma/client";

export type PostOrReplyWithAuthor = {
  post: (Post | Reply) & {
      _count: {
          likes: number;
          replies: number;
      };
  };
  author: {
      username: string;
      id: string;
      profileImageUrl: string;
  };
};
