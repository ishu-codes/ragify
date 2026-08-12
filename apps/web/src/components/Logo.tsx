import { Link } from "react-router-dom";
import { GraduationCapIcon } from "lucide-react";

export default function Logo() {
  return (
    <Link to="/workspaces" className="flex items-center space-x-2">
      <GraduationCapIcon className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold tracking-tight">Ragify</span>
    </Link>
  );
}
