// lib/authOptions.js
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Add other providers as needed.
  ],
  callbacks: {
    async session({ session, token }) {
      // Ensure that the session includes the user ID.
      session.user.id = token.sub;
      return session;
    },
  },
  // You can add additional options as needed.
};
