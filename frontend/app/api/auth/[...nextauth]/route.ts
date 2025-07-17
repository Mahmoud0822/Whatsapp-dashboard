import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "@/lib/api";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("Received credentials:", credentials);

        if (!credentials?.email || !credentials?.password) {
          console.log("Missing credentials");
          return null;
        }

        try {
          const response = await authApi.login(credentials.email, credentials.password);
          console.log("Login response:", response.data);

          const { token, data } = response.data;

          if (data?.user && token) {
            console.log("Authorized user:", data.user);
            return {
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              accessToken: token,
            };
          }

          console.log("No user or token returned");
          return null;
        } catch (err) {
          console.error("Auth error:", err);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 يوم
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
