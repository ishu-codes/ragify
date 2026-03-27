import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { router } from "@/router";
import "@/index.css";

const client = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
        <Toaster richColors />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
