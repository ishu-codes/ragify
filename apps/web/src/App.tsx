import { Routes, Route } from "react-router-dom";

import LandingPage from "@/pages/LandingPage";
import PrivacyPage from "@/pages/PrivacyPage";
import TermsPage from "@/pages/TermsPage";

import AuthLayout from "@/pages/auth/AuthLayout";
import SignInPage from "@/pages/auth/SignInPage";
import SignUpPage from "@/pages/auth/SignUpPage";

import WorkspacesPage from "@/pages/workspaces/WorkspacesPage";
import WorkspaceLayout from "@/pages/workspaces/WorkspaceLayout";
import WorkspaceOverviewPage from "@/pages/workspaces/WorkspaceOverviewPage";
import WorkspaceChatPage from "@/pages/workspaces/WorkspaceChatPage";
import WorkspaceUploadPage from "@/pages/workspaces/WorkspaceUploadPage";
import WorkspaceSettingsPage from "@/pages/workspaces/WorkspaceSettingsPage";

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
			<Route path="/workspaces" element={<WorkspacesPage />} />
			<Route path="/workspaces/:workspaceId" element={<WorkspaceLayout />}>
				<Route index element={<WorkspaceOverviewPage />} />
				<Route path="chat" element={<WorkspaceChatPage />} />
				<Route path="upload" element={<WorkspaceUploadPage />} />
				<Route path="settings" element={<WorkspaceSettingsPage />} />
			</Route>
		</Routes>
	);
}
