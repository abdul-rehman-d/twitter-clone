import { clerkClient } from "@clerk/nextjs/server";
import { type Post } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";
import filterUserForClient from "~/server/helpers/filterUserForClient";

const addUserToPosts = (async (posts: (
  (Post & { _count: { likes: number, replies: number }})
)[]) => {
  const userIds = posts.map(post => post.authorId)
  const users = (
    await clerkClient.users.getUserList({
      userId: userIds,
      limit: 100,
    })
    ).map(filterUserForClient)

  return posts.map(
    post => {
      const author = users.find(user => user.id === post.authorId)

      if (!author || !author.username)
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' })

      return{
        post,
        author: {
          ...author,
          username: author.username
        }
      }
    }
  )
})

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.post.findMany({
      take: 100,
      orderBy: [{ createdAt: "desc" }],
      include: {
        _count: {
          select: { likes: true, replies: true },
        },
      },
    }).then(addUserToPosts);
  }),
  create: privateProcedure.input(
    z.object({
      content: z.string().min(3).max(255)
    })
  ).mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser;

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content
      }
    })

    return post;
  }),
  getById: publicProcedure.input(
    z.object({
      id: z.string()
    })
  ).query(async ({ ctx, input }) => {
    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.id
      },
      include: {
        _count: {
          select: { likes: true, replies: true },
        },
      },
    })

    if (!post) throw new TRPCError({ code: "NOT_FOUND" })

    return (await addUserToPosts([post]))[0]
  }),
  getPostsByUserId: publicProcedure.input(
    z.object({
      userId: z.string()
    })
  ).query(async ({ ctx, input }) => {
    return (
      ctx.prisma.post
      .findMany({
        where: {
          authorId: input.userId
        },
        include: {
          _count: {
            select: { likes: true, replies: true },
          },
        },
        take: 100,
        orderBy: [{"createdAt": "desc"}]
      })
      .then(addUserToPosts)
    );
  }),
  reply: privateProcedure.input(
    z.object({
      postId: z.string(),
      content: z.string().min(3).max(255)
    })
  ).mutation(async ({ ctx, input }) => {
    const authorId = ctx.currentUser;

    const post = await ctx.prisma.post.findUnique({
      where: {
        id: input.postId
      }
    })

    if (!post) throw new TRPCError({ code: "NOT_FOUND" })

    const reply = await ctx.prisma.reply.create({
      data: {
        repliedBy: authorId,
        postId: input.postId,
        content: input.content,
      }
    })

    return reply;
  }),
});
