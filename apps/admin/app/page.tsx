import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isGodUser } from "@/lib/config/godusers";

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!isGodUser(session.user.email)) {
    redirect("/auth/signin");
  }

  redirect("/dashboard");
}

