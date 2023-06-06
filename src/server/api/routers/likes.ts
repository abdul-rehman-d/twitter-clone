import { z } from "zod";

import { createTRPCRouter, privateProcedure } from "~/server/api/trpc";

export const likesRouter = createTRPCRouter({
  likeOrDislike: privateProcedure.input(
    z.object({
      postId: z.string(),
    })
  ).mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser;

    const like = await ctx.prisma.like.findFirst({
      where: {
        likedBy: authorId,
        postId: input.postId,
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
        postId: input.postId,
      }
    })
  }),
  isLiked: privateProcedure.input(
    z.object({
      postId: z.string(),
    })
  ).query(async ({ ctx, input }) => {
    const authorId = ctx.currentUser;

    const like = await ctx.prisma.like.findFirst({
      where: {
        likedBy: authorId,
        postId: input.postId,
      }
    })

    return like!==null;
  }),
});
