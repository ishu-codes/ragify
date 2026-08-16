import { Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/LandingPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";

import AuthLayout from "@/pages/auth/Layout";
import SignInPage from "@/pages/auth/SignIn";
import SignUpPage from "@/pages/auth/SignUp";

import Workspaces from "@/pages/workspaces/Workspaces";
import Layout from "@/pages/workspaces/Layout";
import Overview from "@/pages/workspaces/Overview";
import Chat from "@/pages/workspaces/Chat";
import Upload from "@/pages/workspaces/Upload";
import Settings from "@/pages/workspaces/Settings";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/privacy" element={<PrivacyPage />} />
      <Route path="/terms" element={<TermsPage />} />

      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Route>

      {/* Workspaces routes */}
      <Route path="/workspaces" element={<Workspaces />} />
      <Route path="/workspaces/:workspaceId" element={<Layout />}>
        <Route index element={<Overview />} />
        <Route path="chat" element={<Chat />} />
        <Route path="upload" element={<Upload />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}
