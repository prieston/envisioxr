import { Metadata } from "next";
import { redirect } from "next/navigation";
import Signin from "@/components/Auth/Signin";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const siteName = process.env.SITE_NAME;

export const metadata: Metadata = {
  title: `Signin Page | ${siteName}`,
  description: "This is the Signin page description",
};

export default async function SigninPage() {
  const session = await getServerSession(authOptions); // ✅ Use server-side session check

  // ✅ Redirect signed-in users to home
  if (session) {
    redirect("/");
  }

  return <Signin />;
}
