import { clerkClient } from "@clerk/nextjs/server";
import { type Reply } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const addUserToReplies = async (
  replies: (Reply & { _count: { likes: number; replies: number } })[]
) => {
  const userIds = replies.map((reply) => reply.repliedBy);
  const users = (
    await clerkClient.users.getUserList({
      userId: userIds,
      limit: 100,
    })
  ).map(filterUserForClient);

  return replies.map((reply) => {
    const author = users.find((user) => user.id === reply.repliedBy);

    if (!author || !author.username)
      throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return {
      reply,
      author: {
        ...author,
        username: author.username,
      },
    };
  });
};

export const repliesRouter = createTRPCRouter({
  getAllByPostId: publicProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const post = await ctx.prisma.post.findUnique({
        where: {
          id: input.postId,
        },
      });

      if (!post) throw new TRPCError({ code: "NOT_FOUND" });

      const replies = await ctx.prisma.reply.findMany({
        where: {
          postId: input.postId,
        },
        take: 100,
        orderBy: [{ createdAt: "desc" }],
        include: {
          _count: {
            select: { likes: true, replies: true },
          },
        },
      });

      return await addUserToReplies(replies);
    }),
});
