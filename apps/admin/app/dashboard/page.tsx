import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { isGodUser } from "@/lib/config/godusers";
import AdminDashboard from "./components/AdminDashboard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!isGodUser(session.user.email)) {
    redirect("/auth/signin");
  }

  return <AdminDashboard />;
}

