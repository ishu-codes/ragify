import { createBrowserRouter, createRoutesFromElements, Outlet, Route } from "react-router-dom";

import LandingPage from "@/components/LandingPage";
import { AuthLayout, Login, Logout, Register, ProtectedLayout, sessionLoader } from "@/components/auth";
import { WorkspaceLayout, Workspaces } from "@/components/workspaces";
import Home from "@/components/workspaces/home";
import Upload from "@/components/workspaces/upload";
import History from "@/components/workspaces/history";
import Settings from "@/components/workspaces/settings";
import NotFound from "@/components/NotFound";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route path="/" element={<LandingPage />} />

      {/* Auth routes */}
      <Route path="/auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Auth-protected Routes */}
      <Route path="/" element={<ProtectedLayout />}>
        <Route path="workspaces" element={<Outlet />}>
          <Route index element={<Workspaces />} />

          <Route path=":id" element={<WorkspaceLayout />}>
            <Route index element={<Home />} />
            <Route path="upload" element={<Upload />} />
            <Route path="history" element={<History />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Logout */}
        <Route path="/auth/logout" element={<Logout />} />
      </Route>

      {/* Not-found */}
      <Route path="*" element={<NotFound />} />
    </>,
  ),
);
