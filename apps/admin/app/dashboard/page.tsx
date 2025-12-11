import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { isGodUser } from "@/lib/config/godusers";
import AdminDashboard from "./components/AdminDashboard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  if (!isGodUser(session.user.email)) {
    redirect("/auth/signin");
  }

  return <AdminDashboard />;
}

