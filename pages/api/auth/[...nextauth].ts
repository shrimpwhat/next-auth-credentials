import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "../../../prisma";
import argon2 from "argon2";
import { SessionStrategy } from "next-auth/core/types";

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const user = await prisma.user.findFirst({
          where: { email: credentials?.email },
        });
        if (user?.password && credentials?.password)
          if (await argon2.verify(user?.password, credentials?.password)) {
            return user;
          }
        return null;
      },
    }),
  ],
  callbacks: {
    async redirect({ baseUrl }: { baseUrl: string }) {
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt" as SessionStrategy,
  },
};

export default NextAuth(authOptions);
