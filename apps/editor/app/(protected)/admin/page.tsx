import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import AdminDashboard from "./components/AdminDashboard";

const ADMIN_EMAIL = "theofilos@prieston.gr";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  // Check if user is authenticated
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  // Check if user is the admin
  if (session.user.email !== ADMIN_EMAIL) {
    redirect("/projects");
  }

  return <AdminDashboard />;
}

