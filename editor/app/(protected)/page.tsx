// app/page.jsx
import { redirect } from "next/navigation";

export default function HomePage() {
  redirect("/dashboard");
  return null;
}
