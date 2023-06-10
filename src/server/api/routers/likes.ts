import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const likesRouter = createTRPCRouter({
  likeOrDislike: privateProcedure.input(
    z.object({
      id: z.string(),
      isReply: z.boolean(),
    })
  ).mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser;

    const like = await ctx.prisma.like.findFirst({
      where: {
        likedBy: authorId,
        ...(
          input.isReply
          ? {replyId: input.id}
          : {postId: input.id}
        ),
      }
    })

    if (like) {
      return await ctx.prisma.like.delete({
        where: {
          id: like.id,
        }
      });
    }

    return await ctx.prisma.like.create({
      data: {
        likedBy: authorId,
        ...(
          input.isReply
          ? {replyId: input.id}
          : {postId: input.id}
        ),
      }
    })
  }),
  isLiked: privateProcedure.input(
    z.object({
      id: z.string(),
      isReply: z.boolean(),
    })
  ).query(async ({ ctx, input }) => {
    const authorId = ctx.currentUser;

    const like = await ctx.prisma.like.findFirst({
      where: {
        likedBy: authorId,
        ...(
          input.isReply
          ? {replyId: input.id}
          : {postId: input.id}
        ),
      }
    })

    return like!==null;
  }),
});
