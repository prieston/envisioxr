import { redirect } from "next/navigation";

export default function LibraryPage() {
  redirect("/library/models");
  return null;
}
