import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function NewJobRedirectPage() {
  const session = await getSession();

  if (session?.role === "client") {
    redirect("/client/post-job");
  }

  redirect("/register?role=client&redirect=/client/post-job");
}
