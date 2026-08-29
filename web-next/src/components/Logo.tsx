import Link from "next/link";
import { Wordmark } from "@/components/marketing/Wordmark";

export default function Logo() {
  return (
    <Link href="/workspaces" aria-label="Ragify workspaces">
      <Wordmark size="md" />
    </Link>
  );
}
