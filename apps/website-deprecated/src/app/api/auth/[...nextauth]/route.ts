import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // ✅ Import from src/lib/authOptions

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // ✅ Only export request handlers
