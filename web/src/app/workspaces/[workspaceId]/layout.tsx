import type { ReactNode } from "react";
import ProtectedLayout from "./ProtectedLayout";

interface Props {
  children: ReactNode;
  params: Promise<{
    workspaceId: string;
  }>;
}

export default async function WorkspaceLayout({ children, params }: Props) {
  const { workspaceId } = await params;

  return <ProtectedLayout {...{ workspaceId }}>{children}</ProtectedLayout>;
}
