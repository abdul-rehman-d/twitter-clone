import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import {
  createTRPCRouter,
  privateProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import filterUserForClient from "~/server/helpers/filterUserForClient";

export const profileRouter = createTRPCRouter({
  getUserByUsername: publicProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input }) => {
      const [user] = await clerkClient.users.getUserList({
        username: [input.username],
      });
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }
      return filterUserForClient(user);
    }),
  assignUsername: privateProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const user = await clerkClient.users.getUser(ctx.currentUser);
      if (!user) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User not found",
        });
      }

      // check if taken
      const [existingUser] = await clerkClient.users.getUserList({
        username: [input.username],
      });

      if (existingUser) {
        console.log("existingUser", existingUser);
        throw new TRPCError({
          code: "CONFLICT",
          message: "Username taken",
        });
      }

      // update username
      await clerkClient.users.updateUser(ctx.currentUser, {
        username: input.username,
      });
    }),
});
