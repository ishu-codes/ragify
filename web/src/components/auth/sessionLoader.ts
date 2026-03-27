// import { authClient } from "@/lib/authClient";

export async function sessionLoader() {
  const { data: session } = await authClient.getSession();
  return { session };
}
