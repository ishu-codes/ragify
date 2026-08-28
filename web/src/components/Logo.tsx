import { Link } from "react-router-dom";
import { Wordmark } from "@/components/marketing/Wordmark";

export default function Logo() {
  return (
    <Link to="/workspaces" aria-label="Ragify workspaces">
      <Wordmark size="md" />
    </Link>
  );
}
