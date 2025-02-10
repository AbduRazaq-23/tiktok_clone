import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectDB } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export const authOption: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        try {
          await connectDB();

          const findUser = await User.findOne({ email: credentials.email });

          if (!findUser) {
            throw new Error("Email not found");
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            findUser.password
          );

          if (!isValidPassword) {
            throw new Error("Invalid password");
          }

          // Return a valid user object with required fields
          return {
            id: findUser._id.toString(),
            name: findUser.name,
            email: findUser.email,
          };
        } catch (error) {
          console.error("Authorization error");
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.AUTH_SECRET,
};
